// SaathChalo — Firebase initialization (Phase 0)
//
// Initializes all Firebase services used by the MVP on the free Spark tier:
// Auth, Firestore, Realtime Database, Storage, and Cloud Messaging.
//
// The app is built so it still runs without a `.env` file (prototype mode):
// when the required env vars are missing or still placeholders, every export
// is `null` and `isFirebaseConfigured` is `false`, so UI code can fall back
// to hardcoded demo data.

import { initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'
import { getDatabase, type Database } from 'firebase/database'
import { getStorage, type FirebaseStorage } from 'firebase/storage'
import { getMessaging, isSupported, type Messaging } from 'firebase/messaging'

const env = import.meta.env

const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID,
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID,
  databaseURL: env.VITE_FIREBASE_DATABASE_URL,
}

/** True only when a real Firebase config is present (not the .env.example placeholders). */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.startsWith('your-') &&
    !firebaseConfig.projectId.startsWith('your-'),
)

let app: FirebaseApp | null = null
let auth: Auth | null = null
let db: Firestore | null = null
let rtdb: Database | null = null
let storage: FirebaseStorage | null = null
let messaging: Messaging | null = null

if (isFirebaseConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = getFirestore(app)
  if (firebaseConfig.databaseURL) {
    rtdb = getDatabase(app)
  }
  storage = getStorage(app)

  // Cloud Messaging requires browser support + a service worker; resolve lazily.
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    isSupported()
      .then((supported) => {
        if (supported && app) messaging = getMessaging(app)
      })
      .catch(() => {
        messaging = null
      })
  }
}

export { app, auth, db, rtdb, storage, messaging }
