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
  apiKey: "AIzaSyAdauHEBv1zLH-b-RXyGCAkYzdpFnBZhJk",
  authDomain: "saathchalo-96bea.firebaseapp.com",
  projectId: "saathchalo-96bea",
  storageBucket: "saathchalo-96bea.firebasestorage.app",
  messagingSenderId: "394400154832",
  appId: "1:394400154832:web:0f0eea172837ea9af7cad5",
  measurementId: "G-32KGTEP15S",
  databaseURL: "https://saathchalo-96bea-default-rtdb.firebaseio.com",
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
