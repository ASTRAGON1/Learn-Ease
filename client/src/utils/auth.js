import { auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Get MongoDB JWT token using Firebase Auth
 * This function checks if user is authenticated with Firebase and gets MongoDB JWT token
 */
export async function getMongoDBToken() {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    return null;
  }

  try {
    // Get Firebase ID token
    const firebaseToken = await currentUser.getIdToken();
    const firebaseUID = currentUser.uid;
    const email = currentUser.email;

    // Call MongoDB login endpoint with Firebase UID
    const response = await fetch(`${API_URL}/api/teachers/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        email,
        firebaseUID 
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Failed to get MongoDB token:', response.status, errorData);
      return null;
    }

    const data = await response.json();
    return data.data?.token || null;
  } catch (error) {
    console.error('Error getting MongoDB token:', error);
    return null;
  }
}

/**
 * Wait for Firebase Auth to initialize and get current user
 */
export function waitForAuth() {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

