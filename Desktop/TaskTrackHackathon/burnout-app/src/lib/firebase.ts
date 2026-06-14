import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDsg2BCZvwslrEUbyLfrnCd-o7QKZ3iTu4",
  authDomain: "tasktrackinggame.firebaseapp.com",
  projectId: "tasktrackinggame",
  storageBucket: "tasktrackinggame.firebasestorage.app",
  messagingSenderId: "741769666388",
  appId: "1:741769666388:web:5d3e391299fe1645c8b2c1",
  measurementId: "G-9E315FQZEX",
};

// Initialize Firebase — safe for both client and server environments
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;
let googleProvider: GoogleAuthProvider;

if (typeof window !== "undefined") {
  // Client-side: initialize normally
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
} else {
  // Server-side: initialize app only (auth/firestore not needed during SSR)
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
  auth = getAuth(app);
  db = getFirestore(app);
  googleProvider = new GoogleAuthProvider();
}

export { app, auth, db, googleProvider };
