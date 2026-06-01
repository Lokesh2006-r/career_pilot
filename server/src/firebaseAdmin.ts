import * as admin from 'firebase-admin';

export let db: admin.firestore.Firestore | null = null;
export let storage: admin.storage.Storage | null = null;
export let auth: admin.auth.Auth | null = null;

export const isFirebaseAdminConfigured = !!process.env.FIREBASE_SERVICE_ACCOUNT_KEY || !!process.env.GOOGLE_APPLICATION_CREDENTIALS;

if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
      // From a JSON string in the env var
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      // From Application Default Credentials file path
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } else {
      console.warn('[Firebase Admin] No credentials found. Firebase features will be disabled.');
      console.warn('[Firebase Admin] Set FIREBASE_SERVICE_ACCOUNT_KEY in server/.env to enable them.');
    }
  } catch (error) {
    console.error('[Firebase Admin] Initialization error:', error);
  }
}

if (admin.apps.length) {
  db = admin.firestore();
  storage = admin.storage();
  auth = admin.auth();
}
