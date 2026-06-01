require('dotenv').config();
const admin = require('firebase-admin');

// We use the same env format
if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  });
  console.log('Firebase initialized');
} else {
  console.log('FIREBASE_SERVICE_ACCOUNT_KEY not set');
  process.exit(0);
}

const db = admin.firestore();

async function run() {
  try {
    const collections = await db.listCollections();
    console.log('Collections:', collections.map(c => c.id));
    for (const coll of collections) {
      const snapshot = await db.collection(coll.id).limit(10).get();
      console.log(`Collection ${coll.id}: ${snapshot.size} documents`);
      snapshot.forEach(doc => {
        console.log(`Document ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
}

run();
