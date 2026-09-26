// SaathChalo — Auth Context (Phase 1)
//
// Provides Firebase authentication (email/password, Google, phone) +
// Firestore user profile sync. When Firebase is not configured (.env missing),
// falls back to prototype mode so the existing UI flows continue to work.

import {
  createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode,
} from 'react'
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  linkWithCredential,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  type User as FirebaseUser,
  type ConfirmationResult,
  AuthErrorCodes,
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../lib/firebase'
import {
  createUserDocument,
  getUserDocument,
  updateUserDocument,
  type FirestoreUserProfile,
  type ProfileUpdateFields,
} from '../lib/userService'

// ── Types ────────────────────────────────────────────────────────────────────

export type Role = 'customer' | 'rider' | null
export type VerificationStatus = 'none' | 'pending' | 'verified' | 'rejected'

export interface UserProfile {
  uid: string | null
  email: string | null
  name: string | null
  phone: string | null
  area: string | null
  photoUrl: string | null
  role: Role
  roles: string[]
  verificationStatus: VerificationStatus
  emailVerified: boolean
}

interface AuthContextValue {
  user: UserProfile | null
  loading: boolean
  /** True while the authenticated user's Firestore profile doc is being fetched. */
  profileLoading: boolean
  firebaseReady: boolean
  // ── Auth actions ──
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  sendPhoneCode: (phoneNumberE164: string) => Promise<void>
  confirmPhoneCode: (code: string) => Promise<void>
  signOutUser: () => Promise<void>
  resendVerification: () => Promise<void>
  checkEmailVerified: () => Promise<boolean>
  reloadUser: () => Promise<void>
  // ── Profile actions ──
  updateProfile: (fields: ProfileUpdateFields) => Promise<void>
  setRoles: (roles: string[]) => Promise<void>
  // ── Prototype-compatible setters ──
  setRole: (role: Role) => void
  setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

// ── Helpers ──────────────────────────────────────────────────────────────────

function firebaseUserToProfile(fbUser: FirebaseUser, docData?: FirestoreUserProfile | null): UserProfile {
  return {
    uid: fbUser.uid,
    email: fbUser.email,
    name: docData?.name ?? fbUser.displayName ?? null,
    phone: docData?.phone ?? fbUser.phoneNumber ?? null,
    area: docData?.area ?? null,
    photoUrl: docData?.photoUrl ?? fbUser.photoURL ?? null,
    role: (docData?.roles?.[0] as Role) ?? null,
    roles: docData?.roles ?? [],
    verificationStatus: docData?.verificationStatus ?? 'none',
    emailVerified: fbUser.emailVerified,
  }
}

// ── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  // When a demo account is active, suppress onAuthStateChanged from clearing
  // the user state (there is no real Firebase session behind demo logins).
  const demoModeRef = useRef(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const recaptchaRef = useRef<RecaptchaVerifier | null>(null)
  const confirmationRef = useRef<ConfirmationResult | null>(null)

  // Observe Firebase auth state
  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false)
      return
    }
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // Skip Firebase auth-state reactions while a demo account is active.
      if (demoModeRef.current) return

      if (!fbUser) {
        setUser(null)
        setLoading(false)
        setProfileLoading(false)
        return
      }

      console.info('[AuthContext] auth state: signed in', { uid: fbUser.uid, email: fbUser.email })

      // Reflect the authenticated Firebase user IMMEDIATELY so routing never
      // bounces a signed-in user back to the login screen while the Firestore
      // profile doc is still being fetched.
      setUser(firebaseUserToProfile(fbUser))
      setLoading(false)

      // Then merge in the Firestore profile (best-effort; separate state).
      const uid = fbUser.uid
      setProfileLoading(true)
      try {
        const docData = await getUserDocument(uid)
        // Guard against a stale response if the user signed out meanwhile.
        if (auth?.currentUser?.uid === uid) {
          setUser(firebaseUserToProfile(fbUser, docData))
        }
      } catch {
        /* keep the Firebase-only profile; user stays authenticated */
      } finally {
        if (auth?.currentUser?.uid === uid) setProfileLoading(false)
      }
    })
    return unsubscribe
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    if (!auth) return
    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await createUserDocument(cred.user.uid, { name: '', email })
    await sendEmailVerification(cred.user)
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!auth) return
    await signInWithEmailAndPassword(auth, email, password)
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!auth) return
    const provider = new GoogleAuthProvider()
    const cred = await signInWithPopup(auth, provider)
    console.info('[AuthContext] Google sign-in succeeded', { uid: cred.user.uid, email: cred.user.email })

    // Reflect the authenticated user IMMEDIATELY. The Firestore bootstrap below
    // is best-effort: it must never throw and bounce the user back to the
    // login screen after a successful authentication.
    setUser(firebaseUserToProfile(cred.user))
    setLoading(false)

    try {
      await createUserDocument(cred.user.uid, {
        name: cred.user.displayName ?? '',
        email: cred.user.email ?? '',
      })
      // Re-read the profile so user state reflects the freshly-created doc.
      // onAuthStateChanged may have fired before the doc was written.
      const docData = await getUserDocument(cred.user.uid)
      setUser(firebaseUserToProfile(cred.user, docData))
    } catch (err) {
      // Auth is still valid; profile doc will be created on the next save.
      console.warn('[AuthContext] profile bootstrap after Google sign-in failed:', err)
    }
  }, [])

  // ── Phone auth helpers ──
  const clearRecaptcha = useCallback(() => {
    try { recaptchaRef.current?.clear() } catch { /* ignore */ }
    recaptchaRef.current = null
  }, [])

  const ensureRecaptcha = useCallback((): RecaptchaVerifier => {
    if (recaptchaRef.current) return recaptchaRef.current
    // Create an invisible container if the UI hasn't rendered one
    let el = document.getElementById('recaptcha-container')
    if (!el) {
      el = document.createElement('div')
      el.id = 'recaptcha-container'
      document.body.appendChild(el)
    }
    recaptchaRef.current = new RecaptchaVerifier(auth!, el, { size: 'invisible' })
    return recaptchaRef.current
  }, [])

  const sendPhoneCode = useCallback(async (phoneNumberE164: string) => {
    if (!auth) return
    try {
      clearRecaptcha()
      const verifier = ensureRecaptcha()
      confirmationRef.current = await signInWithPhoneNumber(auth, phoneNumberE164, verifier)
    } catch (err) {
      clearRecaptcha()
      throw err
    }
  }, [clearRecaptcha, ensureRecaptcha])

  const confirmPhoneCode = useCallback(async (code: string) => {
    if (!confirmationRef.current) throw new Error('No verification code was sent. Request one first.')
    const cred = await confirmationRef.current.confirm(code)
    // If the phone was linked to an existing email/password account,
    // Firebase returns the existing user and no doc is needed.
    await createUserDocument(cred.user.uid, {
      name: cred.user.displayName ?? '',
      email: cred.user.email ?? '',
    })
    if (cred.user.phoneNumber) {
      await updateUserDocument(cred.user.uid, { phone: cred.user.phoneNumber }).catch(() => {})
    }
  }, [])

  const signOutUser = useCallback(async () => {
    demoModeRef.current = false
    setUser(null)
    if (!auth) return
    try { await firebaseSignOut(auth) } catch { /* no active session */ }
  }, [])

  const resendVerification = useCallback(async () => {
    if (auth?.currentUser && !auth.currentUser.emailVerified) {
      await sendEmailVerification(auth.currentUser)
    }
  }, [])

  /** Reloads the current Firebase user and returns whether email is verified. */
  const checkEmailVerified = useCallback(async (): Promise<boolean> => {
    if (!auth?.currentUser) return false
    await auth.currentUser.reload()
    const verified = auth.currentUser.emailVerified
    if (verified) {
      setUser((prev) => prev ? { ...prev, emailVerified: true } : null)
    }
    return verified
  }, [])

  /** Forces a reload of the Firebase user token and re-reads the Firestore doc. */
  const reloadUser = useCallback(async () => {
    if (!auth?.currentUser) return
    await auth.currentUser.reload()
    try {
      const docData = await getUserDocument(auth.currentUser.uid)
      setUser(firebaseUserToProfile(auth.currentUser, docData))
    } catch {
      setUser(firebaseUserToProfile(auth.currentUser))
    }
  }, [])

  const updateProfile = useCallback(async (fields: ProfileUpdateFields) => {
    if (!auth?.currentUser) return
    await updateUserDocument(auth.currentUser.uid, fields)
    setUser((prev) => prev ? { ...prev, ...fields } : null)
  }, [])

  const setRoles = useCallback(async (roles: string[]) => {
    if (!auth?.currentUser) return
    await updateUserDocument(auth.currentUser.uid, { roles })
    setUser((prev) => prev ? { ...prev, roles, role: (roles[0] as Role) ?? null } : null)
  }, [])

  const setRole = useCallback((role: Role) => {
    setUser((prev) => (prev ? { ...prev, role } : null))
  }, [])

  /** Wrapped setUser that activates/deactivates demo mode automatically. */
  const setUserWithDemo = useCallback((u: UserProfile | null) => {
    demoModeRef.current = u !== null && (u.uid ?? '').startsWith('demo-')
    if (demoModeRef.current) setProfileLoading(false)
    setUser(u)
  }, [])

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        profileLoading,
        firebaseReady: isFirebaseConfigured,
        signUp,
        signIn,
        signInWithGoogle,
        sendPhoneCode,
        confirmPhoneCode,
        signOutUser,
        resendVerification,
        checkEmailVerified,
        reloadUser,
        updateProfile,
        setRoles,
        setRole,
        setUser: setUserWithDemo,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within an <AuthProvider>')
  }
  return ctx
}
