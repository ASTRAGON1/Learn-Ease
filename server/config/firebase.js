const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
let firebaseInitialized = false;

try {
  // Check if Firebase Service Account Key is provided as JSON string
  if (process.env. FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Parse the JSON service account key
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    

    if (serviceAccount.private_key) {
      serviceAccount.private_key = serviceAccount.private_key.replace(/\\n/g, '\n');
    }
    
    admin.initializeApp({
      credential: admin.credential. cert(serviceAccount)
    });
    
    firebaseInitialized = true;
    console. log('✅ Firebase Admin SDK initialized successfully');
  } 
  // ...  rest of your code
  // Fallback: Check if Firebase credentials are provided as individual environment variables
  else if (process.env.FIREBASE_PROJECT_ID && 
           process.env.FIREBASE_CLIENT_EMAIL && 
           process.env.FIREBASE_PRIVATE_KEY) {
    
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      })
    });
    
    firebaseInitialized = true;
    console.log('✅ Firebase Admin SDK initialized successfully');
  } 
  else {
    console.warn('⚠️  Firebase credentials not found in environment variables');
    console.warn('   Firebase user deletion will be skipped');
    console.warn('   Add FIREBASE_SERVICE_ACCOUNT_KEY or individual credentials to .env');
  }
} catch (error) {
  console.error('❌ Error initializing Firebase Admin SDK:', error.message);
  console.warn('   Firebase user deletion will be skipped');
}

/**
 * Delete a user from Firebase Authentication
 * @param {string} firebaseUID - The Firebase UID of the user to delete
 * @returns {Promise<boolean>} - True if deleted, false if skipped or failed
 */
async function deleteFirebaseUser(firebaseUID) {
  // If Firebase is not initialized, skip deletion
  if (!firebaseInitialized) {
    console.warn('⚠️  Firebase not initialized, skipping Firebase user deletion');
    return false;
  }

  // If no Firebase UID provided, skip
  if (!firebaseUID) {
    console.log('ℹ️  No Firebase UID provided, skipping Firebase deletion');
    return false;
  }

  try {
    await admin.auth().deleteUser(firebaseUID);
    console.log(`✅ Successfully deleted Firebase user: ${firebaseUID}`);
    return true;
  } catch (error) {
    // If user doesn't exist in Firebase, that's okay
    if (error.code === 'auth/user-not-found') {
      console.log(`ℹ️  Firebase user ${firebaseUID} not found (already deleted or never existed)`);
      return true;
    }
    
    console.error(`❌ Error deleting Firebase user ${firebaseUID}:`, error.message);
    return false;
  }
}

module.exports = {
  admin,
  deleteFirebaseUser,
  firebaseInitialized
};

