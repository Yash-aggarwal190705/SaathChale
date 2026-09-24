// SaathChalo — Auth Context (Phase 0)
//
// Wraps the current prototype's role/appSection state so existing flows keep
// working unchanged. In Phase 1 this will be extended with real Firebase Auth.

import { createContext, useContext, useState, type ReactNode } from 'react'

export type Role = 'customer' | 'rider' | null
export type VerificationStatus = 'none' | 'pending' | 'approved' | 'rejected'

export interface UserProfile {
  uid: string | null
  email: string | null
  name: string | null
  phone: string | null
  role: Role
  verificationStatus: VerificationStatus
}

interface AuthContextValue {
  /** Current signed-in user profile (null = not authenticated) */
  user: UserProfile | null
  /** True while auth state is being resolved */
  loading: boolean
  /** Whether Firebase is configured (env vars present) */
  firebaseReady: boolean
  // ── Prototype-compatible setters (used by existing App.tsx flows) ──
  setRole: (role: Role) => void
  setUser: (user: UserProfile | null) => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading] = useState(false) // Phase 1: will observe Firebase auth state

  const setRole = (role: Role) => {
    setUser((prev) => (prev ? { ...prev, role } : null))
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        firebaseReady: false, // Phase 1: import isFirebaseConfigured from lib/firebase
        setRole,
        setUser,
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
