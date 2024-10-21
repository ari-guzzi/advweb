import { writable } from 'svelte/store';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, storage } from "../lib/firebase/firebase";
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { nanoid } from 'nanoid';

export const authStore = writable({
    user: null,
    loading: true
});
//const auth = getAuth();

onAuthStateChanged(auth, (user) => {
    if (user) {
      // User is signed in
      authStore.set({ user, loading: false });
    } else {
      // User is signed out
      authStore.set({ user: null, loading: false });
    }
  });

export const authHandlers = {
    signup: async (email, pass) => {
        
        await createUserWithEmailAndPassword(auth, email, pass)
    },
    login: async (email, pass) => {
       
        await signInWithEmailAndPassword(auth, email, pass)
    },
    logout: async () => {
       
        await signOut(auth)
    }
};

export const uploadFile = async (file, folder) => {
    try {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const allowedExtensions = ['csv', 'json', 'xml', 'xlsx', 'xls']; // Add allowed file extensions here
      if (!allowedExtensions.includes(fileExtension)) {
        throw new Error('File type not allowed');
      }
     const filename = nanoid();

  
    const storageRef = ref(storage, `${folder}${filename}.${fileExtension}`);
     //const storageRef = ref(storage, `${folder}${filename}.${file.name.split('.').pop()}`);
     const res = await uploadBytes(storageRef, file);
     return res.metadata.fullPath;
    } catch (error) {
     throw error;
    }
   };
   export const getFile = async (path) => {
    try {
     const fileRef = ref(storage, path);
     return getDownloadURL(fileRef);
    } catch (error) {
     throw error;
    }
   };