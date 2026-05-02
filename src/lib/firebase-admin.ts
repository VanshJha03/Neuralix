
import admin from 'firebase-admin';

if (!admin.apps.length) {
  try {
    // Determine the service account source
    // In production (Vercel), we expect FIREBASE_SERVICE_ACCOUNT env var
    // In local dev, we can use the provided path
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT 
        ? JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
        : require('C:/Users/vansh/OneDrive/Apps/ArsCreatio/SERVICE_ACCOUNT_JSON.json');

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log('🔥 Firebase Admin Synchronized (Singleton)');
  } catch (error) {
    console.error('Neural Link Auth Error:', error);
  }
}

export const adminAuth = admin.auth();
export const adminDb = admin.firestore();
