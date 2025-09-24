
import 'server-only';
import { cookies } from 'next/headers';
import type { User } from '@/lib/types';
import { db } from './firebase';
import { doc, getDoc } from 'firebase/firestore';

// This is a placeholder for a real session management system.
// In a production app, you would use a library like next-auth or a custom solution with JWTs.

type Session = {
  user: Omit<User, 'addresses' | 'phoneNumber'>;
  vendorId?: string;
  dispatcherId?: string;
};

// This is a simplified, insecure way to "get" a session.
// It relies on the login page setting a cookie.
export async function getServerSession(): Promise<Session | null> {
  const cookieStore = cookies();
  const userCookie = cookieStore.get('session_user');
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie.value) as User;
      const session: Session = { user };

      if (user.role === 'vendor') {
        // Fetch the user document from Firestore to get the vendorId
        const userDoc = await getDoc(doc(db, 'users', user.id));
        if (userDoc.exists()) {
          const userData = userDoc.data() as User & { vendorId?: string };
          if (userData.vendorId) {
            session.vendorId = userData.vendorId;
          }
        }
      }
      
      if (user.role === 'dispatcher') {
         const userDoc = await getDoc(doc(db, 'users', user.id));
          if (userDoc.exists()) {
             session.dispatcherId = user.id; 
          }
      }

      return session;
    } catch (e) {
      console.error('Failed to parse user session cookie', e);
      return null;
    }
  }

  return null;
}
