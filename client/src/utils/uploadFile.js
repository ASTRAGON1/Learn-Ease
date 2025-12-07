import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../config/firebase';

const makePath = (folder, uid, file) => {
  // Sanitize filename: replace special characters but keep extension
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
  const timestamp = Date.now();
  return `${folder}/${uid}/${timestamp}_${sanitizedName}`;
};

export const uploadFile = (file, folder = 'documents', firebaseUid = null, onProgress = null) =>
  new Promise((resolve, reject) => {
    if (!file) {
      return reject(new Error('No file provided'));
    }
    
    const uid = firebaseUid || (auth.currentUser && auth.currentUser.uid);
    if (!uid) return reject(new Error('Not authenticated (firebase uid)'));
    
    const path = makePath(folder, uid, file);
    console.log('Upload path:', path);
    console.log('Original filename:', file.name);
    
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on('state_changed',
      snap => { if (onProgress) onProgress(Math.round((snap.bytesTransferred/snap.totalBytes)*100)); },
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
  
  console.log('Deleting file from Firebase Storage with path:', path);
  const storageRef = ref(storage, path);
  
  try {
    await deleteObject(storageRef);
    console.log('✅ Successfully deleted file:', path);
  } catch (error) {
    console.error('❌ Firebase Storage deletion error:', error);
    // If file doesn't exist, that's okay - it's already deleted
    if (error.code === 'storage/object-not-found') {
      console.log('File not found in Firebase Storage (may have been already deleted):', path);
      return; // Don't throw error if file doesn't exist
    }
    throw error; // Re-throw other errors
  }
};