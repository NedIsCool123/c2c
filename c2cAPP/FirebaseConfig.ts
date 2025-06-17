import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDjXJu4zcJqbbLD-xGVqjwUJMFW4VR2-xA",
  authDomain: "c2cauth.firebaseapp.com",
  projectId: "c2cauth",
  storageBucket: "c2cauth.firebasestorage.app",
  messagingSenderId: "562408490380",
  appId: "1:562408490380:web:6f866bc5cfcf8c8657c2a9"
};

// Initialize Firebase
export const FIREBASE_APP = initializeApp(firebaseConfig);
export const FIREBASE_AUTH = getAuth(FIREBASE_APP);
export const FIREBASE_DB = getFirestore(FIREBASE_APP);