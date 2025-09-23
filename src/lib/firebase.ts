
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, doc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAoAz5EDSgmFMGL4Gvubu6sRQCZa8t7k_c",
  authDomain: "studio-4884956211-8d085.firebaseapp.com",
  projectId: "studio-4884956211-8d085",
  storageBucket: "studio-4884956211-8d085.firebasestorage.app",
  messagingSenderId: "360937385656",
  appId: "1:360937385656:web:2cd2a65d57b10839320e4d"
};


// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db, doc };
