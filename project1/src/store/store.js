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
        const auth = getAuth();
        await createUserWithEmailAndPassword(auth, email, pass)
    },
    login: async (email, pass) => {
        const auth = getAuth();
        await signInWithEmailAndPassword(auth, email, pass)
    },
    logout: async () => {
        const auth = getAuth();
        await signOut(auth)
    }
};

export const uploadFile = async (file, folder) => {
    try {
     const filename = nanoid();
     const storageRef = ref(storage, `${folder}${filename}.${file.name.split('.').pop()}`);
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