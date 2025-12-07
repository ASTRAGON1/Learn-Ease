import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage, auth } from '../config/firebase';

const makePath = (folder, uid, file) => `${folder}/${uid}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.\-_]/g,'_')}`;

export const uploadFile = (file, folder = 'documents', firebaseUid = null, onProgress = null) =>
  new Promise((resolve, reject) => {
    const uid = firebaseUid || (auth.currentUser && auth.currentUser.uid);
    if (!uid) return reject(new Error('Not authenticated (firebase uid)'));
    const path = makePath(folder, uid, file);
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
  await deleteObject(ref(storage, path));
};