import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

// Cache user data to reduce Firestore reads
let currentUserData = null;

export async function checkAuthState() {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (user) => {
        unsubscribe();
        resolve(!!user);
      },
      (error) => {
        unsubscribe();
        reject(error);
      }
    );
  });
}

export function getCurrentUserId() {
  return auth.currentUser?.uid || null;
}

export async function getCurrentUserData(refresh = false) {
  if (currentUserData && !refresh) return currentUserData;
  
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
      currentUserData = {
        id: user.uid,
        ...userDoc.data()
      };
      return currentUserData;
    }
    return null;
  } catch (error) {
    console.error('Error fetching user data:', error);
    return null;
  }
}

export async function getCurrentUserRole() {
  const userData = await getCurrentUserData();
  return userData?.role || null;
}

export function watchAuthState(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Refresh user data when auth state changes
      currentUserData = null;
      await getCurrentUserData(true);
    }
    callback(!!user);
  });
}

// Additional helper functions
export function getCurrentUserEmail() {
  return auth.currentUser?.email || null;
}

export function isEmailVerified() {
  return auth.currentUser?.emailVerified || false;
}