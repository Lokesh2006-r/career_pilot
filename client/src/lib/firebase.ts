import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const isFirebaseConfigured = !!(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;
let _storage: FirebaseStorage | null = null;

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null;
  if (!app) {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }
  return app;
}

export function getFirebaseAuth(): Auth | null {
  if (!isFirebaseConfigured) return null;
  if (!_auth) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) _auth = getAuth(firebaseApp);
  }
  return _auth;
}

export function getFirebaseDb(): Firestore | null {
  if (!isFirebaseConfigured) return null;
  if (!_db) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) _db = getFirestore(firebaseApp);
  }
  return _db;
}

export function getFirebaseStorage(): FirebaseStorage | null {
  if (!isFirebaseConfigured) return null;
  if (!_storage) {
    const firebaseApp = getFirebaseApp();
    if (firebaseApp) _storage = getStorage(firebaseApp);
  }
  return _storage;
}

// Convenience exports (lazy — only initialized when called)
export const auth = new Proxy({} as Auth, {
  get(_target, prop) {
    const instance = getFirebaseAuth();
    if (!instance) {
      if (prop === 'currentUser') return null;
      if (prop === 'onAuthStateChanged') return () => () => {};
      throw new Error('Firebase is not configured. Add credentials to .env.local');
    }
    return (instance as any)[prop];
  }
});

export const db = new Proxy({} as Firestore, {
  get(_target, prop) {
    const instance = getFirebaseDb();
    if (!instance) throw new Error('Firebase is not configured. Add credentials to .env.local');
    return (instance as any)[prop];
  }
});

export const storage = new Proxy({} as FirebaseStorage, {
  get(_target, prop) {
    const instance = getFirebaseStorage();
    if (!instance) throw new Error('Firebase is not configured. Add credentials to .env.local');
    return (instance as any)[prop];
  }
});
