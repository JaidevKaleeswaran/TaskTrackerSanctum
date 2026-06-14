import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsg2BCZvwslrEUbyLfrnCd-o7QKZ3iTu4",
  authDomain: "tasktrackinggame.firebaseapp.com",
  projectId: "tasktrackinggame",
  storageBucket: "tasktrackinggame.firebasestorage.app",
  messagingSenderId: "741769666388",
  appId: "1:741769666388:web:5d3e391299fe1645c8b2c1",
  measurementId: "G-9E315FQZEX",
};

// Initialize Firebase only if it hasn't been initialized already
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider };
