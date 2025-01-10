import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

// Get Firebase Admin instances
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

// User management functions
export async function createUser(email: string, password: string, role: string) {
  try {
    const user = await auth.createUser({
      email,
      password,
      emailVerified: false,
    });

    // Set custom claims for role-based access
    await auth.setCustomUserClaims(user.uid, { role });

    return user;
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
}

export async function updateUserRole(uid: string, role: string) {
  try {
    await auth.setCustomUserClaims(uid, { role });
  } catch (error) {
    console.error('Error updating user role:', error);
    throw error;
  }
}

export async function deleteUser(uid: string) {
  try {
    await auth.deleteUser(uid);
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
}

// Usage tracking functions
export async function updateUserUsage(uid: string, usage: number) {
  try {
    const userRef = db.collection('usage').doc(uid);
    await userRef.set({
      totalUsage: usage,
      lastUpdated: new Date(),
    }, { merge: true });
  } catch (error) {
    console.error('Error updating usage:', error);
    throw error;
  }
}

export async function getUserUsage(uid: string) {
  try {
    const userRef = db.collection('usage').doc(uid);
    const doc = await userRef.get();
    return doc.exists ? doc.data() : null;
  } catch (error) {
    console.error('Error getting usage:', error);
    throw error;
  }
}

// Token verification helper
export async function verifyIdToken(idToken: string) {
  try {
    return await auth.verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying token:', error);
    throw error;
  }
}

// Export instances for direct use
export { auth, db, storage };
