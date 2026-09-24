// SaathChalo — User Service (Phase 1)
//
// Firestore + Storage operations for user profiles and college ID uploads.
// All functions are no-ops (return gracefully) when Firebase is not configured,
// so the prototype continues to work without a .env file.

import {
  doc, getDoc, setDoc, updateDoc, serverTimestamp,
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

  const userRef = doc(db, 'users', uid)
  const existing = await getDoc(userRef)
  if (existing.exists()) return // already created

  await setDoc(userRef, {
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
}

/**
 * Reads the users/{uid} document.
 */
export async function getUserDocument(uid: string): Promise<FirestoreUserProfile | null> {
  if (!isFirebaseConfigured || !db) return null

  try {
    const userRef = doc(db, 'users', uid)
    const snap = await getDoc(userRef)
    if (!snap.exists()) return null
    return snap.data() as FirestoreUserProfile
  } catch (err) {
    console.error('[userService] getUserDocument failed:', err)
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

  try {
    const userRef = doc(db, 'users', uid)
    await updateDoc(userRef, fields as Record<string, unknown>)
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
