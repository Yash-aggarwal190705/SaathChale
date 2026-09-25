// SaathChalo — User Service (Phase 1)
//
// Firestore + Storage operations for user profiles and college ID uploads.
// All functions are no-ops (return gracefully) when Firebase is not configured,
// so the prototype continues to work without a .env file.

import {
  doc, getDoc, getDocFromCache, setDoc, serverTimestamp, runTransaction,
} from 'firebase/firestore'
import {
  ref, uploadBytes, getDownloadURL,
} from 'firebase/storage'
import { db, storage, isFirebaseConfigured } from './firebase'

// ── Types ────────────────────────────────────────────────────────────────────

export interface FirestoreUserProfile {
  name: string
  email: string
  phone: string
  photoUrl: string
  area: string
  collegeIdUrl: string
  verificationStatus: 'none' | 'pending' | 'verified' | 'rejected'
  roles: string[] // ["customer"], ["rider"], or both
  ratingAvg: number
  ratingCount: number
  createdAt?: unknown // Firestore Timestamp
}

export interface ProfileUpdateFields {
  name?: string
  phone?: string
  photoUrl?: string
  area?: string
  collegeIdUrl?: string
  verificationStatus?: 'none' | 'pending' | 'verified' | 'rejected'
  roles?: string[]
}

// ── Firestore operations ─────────────────────────────────────────────────────

/**
 * Creates the initial users/{uid} document on first sign-up.
 */
export async function createUserDocument(
  uid: string,
  data: { name: string; email: string },
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  if (!uid) return

  const userRef = doc(db, 'users', uid)
  try {
    // Transaction = atomic read-then-create, avoiding the read/write race and
    // never clobbering an existing profile.
    await runTransaction(db, async (tx) => {
      const existing = await tx.get(userRef)
      if (existing.exists()) return // already created
      tx.set(userRef, {
        name: data.name || '',
        email: data.email,
        phone: '',
        photoUrl: '',
        area: '',
        collegeIdUrl: '',
        verificationStatus: 'none',
        roles: [],
        ratingAvg: 0,
        ratingCount: 0,
        createdAt: serverTimestamp(),
      })
    })
  } catch (err) {
    // Never let profile-document creation block a successful sign-in.
    // The doc is created lazily on the next profile save (setDoc merge).
    console.warn('[userService] createUserDocument skipped (auth still valid):', err)
  }
}

/**
 * Reads the users/{uid} document.
 */
export async function getUserDocument(uid: string): Promise<FirestoreUserProfile | null> {
  if (!isFirebaseConfigured || !db) return null
  if (!uid) return null

  const userRef = doc(db, 'users', uid)
  try {
    const snap = await getDoc(userRef)
    if (!snap.exists()) return null
    return snap.data() as FirestoreUserProfile
  } catch (err) {
    console.error('[userService] getUserDocument failed:', err)
    // Fall back to the local cache (present when offline persistence is on),
    // so an "offline" error doesn't get mistaken for "no profile exists".
    try {
      const cached = await getDocFromCache(userRef)
      if (cached.exists()) return cached.data() as FirestoreUserProfile
    } catch {
      /* no cached copy available */
    }
    return null
  }
}

/**
 * Updates specific fields on users/{uid}.
 */
export async function updateUserDocument(
  uid: string,
  fields: ProfileUpdateFields,
): Promise<void> {
  if (!isFirebaseConfigured || !db) return
  if (!uid) return

  try {
    const userRef = doc(db, 'users', uid)
    // setDoc with merge creates the doc if it's missing (self-heals when the
    // initial createUserDocument was skipped offline) and only touches the
    // provided fields.
    await setDoc(userRef, fields as Record<string, unknown>, { merge: true })
  } catch (err) {
    console.error('[userService] updateUserDocument failed:', err)
    throw err
  }
}

// ── Storage operations ───────────────────────────────────────────────────────

/**
 * Uploads a college ID image to Firebase Storage at users/{uid}/college-id.jpg
 * and returns the download URL.
 */
export async function uploadCollegeId(
  uid: string,
  file: File,
): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    // Prototype mode: return a fake URL
    return `https://placeholder.saathchalo.app/users/${uid}/college-id.jpg`
  }

  const storageRef = ref(storage, `users/${uid}/college-id.jpg`)
  await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
  })
  return getDownloadURL(storageRef)
}

/**
 * Uploads a profile photo to Firebase Storage at users/{uid}/photo.jpg
 * and returns the download URL.
 */
export async function uploadProfilePhoto(
  uid: string,
  file: File,
): Promise<string> {
  if (!isFirebaseConfigured || !storage) {
    return `https://placeholder.saathchalo.app/users/${uid}/photo.jpg`
  }

  const storageRef = ref(storage, `users/${uid}/photo.jpg`)
  await uploadBytes(storageRef, file, {
    contentType: file.type || 'image/jpeg',
  })
  return getDownloadURL(storageRef)
}
