
import 'server-only';
import { cookies } from 'next/headers';
import type { User } from '@/lib/types';

// This is a placeholder for a real session management system.
// In a production app, you would use a library like next-auth or a custom solution with JWTs.

type Session = {
  user: User;
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
        // In a real app, you might have a mapping from a user ID to a vendor ID.
        // For this demo, we'll hardcode a mapping.
        // Let's assume vendor-admin-1 is linked to vendor-1
        if (user.id === 'vendor-admin-1') {
            session.vendorId = 'vendor-1';
        }
      }
      
      if (user.role === 'dispatcher') {
         session.dispatcherId = user.id; // Assuming the user ID is the dispatcher ID
      }

      return session;
    } catch (e) {
      console.error('Failed to parse user session cookie', e);
      return null;
    }
  }

  return null;
}
