import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../config/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const makePath = (folder, uid, file) => {
  // Sanitize filename: replace special characters but keep extension
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const timestamp = Date.now();
  return `${folder}/${uid}/${timestamp}_${sanitizedName}`;
};

export const uploadFile = (file, folder = 'documents', firebaseUid = null, onProgress = null) =>
  new Promise(async (resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }

    // Wait for Firebase Auth to be ready if needed
    let uid = firebaseUid || (auth.currentUser && auth.currentUser.uid);

    if (!uid) {
      // Wait for auth state to initialize (up to 2 seconds)
      await new Promise((resolveAuth) => {
        let resolved = false;
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolveAuth();
          }
        });
        setTimeout(() => {
          if (!resolved) {
            resolved = true;
            unsubscribe();
            resolveAuth();
          }
        }, 2000);
      });
      uid = firebaseUid || (auth.currentUser && auth.currentUser.uid);
    }

    if (!uid) {
      return reject(new Error('Not authenticated (firebase uid)'));
    }

    // Verify user has a valid token
    try {
      const currentUser = auth.currentUser;
      if (!currentUser || currentUser.uid !== uid) {
        return reject(new Error('Firebase authentication not valid'));
      }

      // Force token refresh to ensure it's valid
      await currentUser.getIdToken(true);
    } catch (tokenError) {
      console.error('Firebase token error:', tokenError);
      return reject(new Error('Firebase authentication token invalid. Please log in again.'));
    }

    const path = makePath(folder, uid, file);

    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on('state_changed',
      snap => { if (onProgress) onProgress(Math.round((snap.bytesTransferred / snap.totalBytes) * 100)); },
      err => reject(err),
      async () => {
        try {
          const url = await getDownloadURL(task.snapshot.ref);
          resolve({ url, path, fileName: task.snapshot.ref.name, originalName: file.name, size: file.size, type: file.type, firebaseUid: uid });
        } catch (e) { reject(e); }
      }
    );
  });

export const deleteFileByPath = async (path) => {
  if (!path) {
    throw new Error('Path is required for deletion');
  }

  const storageRef = ref(storage, path);

  try {
    await deleteObject(storageRef);
  } catch (error) {
    console.error('❌ Firebase Storage deletion error:', error);
    // If file doesn't exist, that's okay - it's already deleted
    if (error.code === 'storage/object-not-found') {
      return; // Don't throw error if file doesn't exist
    }
    throw error; // Re-throw other errors
  }
};