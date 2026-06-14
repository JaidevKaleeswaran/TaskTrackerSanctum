'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

// Guest user shape that mimics Firebase User for compatibility
interface GuestUser {
  displayName: string;
  email: string;
  uid: string;
  isGuest: true;
}

type AppUser = User | GuestUser | null;

interface AuthContextType {
  user: AppUser;
  loading: boolean;
  isGuest: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string) => Promise<void>;
  signInAsGuest: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const GUEST_KEY = 'aegis_guest_session';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AppUser>(null);
  const [loading, setLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check for existing guest session first
    const guestSession = localStorage.getItem(GUEST_KEY);
    if (guestSession) {
      setUser(JSON.parse(guestSession));
      setIsGuest(true);
      setLoading(false);
      return;
    }

    // Otherwise listen for Firebase auth
    try {
      const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setLoading(false);
      });
      return () => unsubscribe();
    } catch {
      // If Firebase fails to initialize, just stop loading
      setLoading(false);
    }
  }, []);

  const signInWithGoogle = async () => {
    await signInWithPopup(auth, googleProvider);
    // Clear guest session if they upgrade to a real account
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  };

  const signInWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName });
    localStorage.removeItem(GUEST_KEY);
    setIsGuest(false);
  };

  const signInAsGuest = () => {
    const guestUser: GuestUser = {
      displayName: 'Guest',
      email: 'guest@aegis.local',
      uid: `guest_${Date.now()}`,
      isGuest: true,
    };
    localStorage.setItem(GUEST_KEY, JSON.stringify(guestUser));
    setUser(guestUser);
    setIsGuest(true);
  };

  const signOut = async () => {
    if (isGuest) {
      localStorage.removeItem(GUEST_KEY);
      setUser(null);
      setIsGuest(false);
    } else {
      try {
        await firebaseSignOut(auth);
      } catch {
        // If Firebase auth fails, just clear state
      }
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, isGuest, signInWithGoogle, signInWithEmail, signUpWithEmail, signInAsGuest, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
