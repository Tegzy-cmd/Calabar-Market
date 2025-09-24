
'use client';

import { auth } from '@/lib/firebase';
import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { ReactNode, createContext, useEffect, useState, useCallback } from 'react';
import { getOrCreateUser } from '@/lib/actions';
import type { User as AppUser } from '@/lib/types';

export interface AuthContextType {
    user: FirebaseUser | null;
    appUser: AppUser | null;
    loading: boolean;
    syncUser: (user: FirebaseUser) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({ user: null, appUser: null, loading: true, syncUser: async () => {} });

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const syncUser = useCallback(async (firebaseUser: FirebaseUser) => {
    if (!firebaseUser) {
        setAppUser(null);
        return;
    }
    const { success, data, error } = await getOrCreateUser(firebaseUser.uid, {
        name: firebaseUser.displayName || 'New User',
        email: firebaseUser.email || '',
        avatarUrl: firebaseUser.photoURL || '',
    });

    if(success && data) {
        setAppUser(data);
    } else {
        console.error("Failed to sync user:", error);
    }
  }, []);


  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        await syncUser(user);
      } else {
        setAppUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [syncUser]);

  return (
    <AuthContext.Provider value={{ user, appUser, loading, syncUser }}>
        {children}
    </AuthContext.Provider>
  );
};
