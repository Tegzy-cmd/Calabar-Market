
'use client';

import { useState, useEffect } from 'react';
import { onSnapshot, collection, query, orderBy, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './use-auth';
import type { ChatMessage } from '@/lib/types';

export function useUnreadMessages(orderId: string, otherUserRole: 'user' | 'vendor' | 'dispatcher') {
  const [hasUnread, setHasUnread] = useState(false);
  const { appUser } = useAuth();
  
  useEffect(() => {
    if (!orderId || !appUser) return;

    const messagesCol = collection(db, `orders/${orderId}/messages`);
    const q = query(
        messagesCol, 
        orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (snapshot.empty) return;
      
      const latestMessage = snapshot.docs[0]?.data() as ChatMessage;

      if (latestMessage && latestMessage.senderId !== appUser.id && latestMessage.senderRole === otherUserRole) {
          // In a real app, you'd store read receipts in Firestore.
          // For this demo, we use localStorage to track the last seen message timestamp.
          const lastSeenTimestamp = localStorage.getItem(`lastSeen_${orderId}_${otherUserRole}`);
          const latestMessageTimestamp = (snapshot.docs[0].data().timestamp.toDate()).toISOString();

          if (!lastSeenTimestamp || latestMessageTimestamp > lastSeenTimestamp) {
              setHasUnread(true);
          }
      }
    });

    return () => unsubscribe();
  }, [orderId, appUser, otherUserRole]);

  const resetUnread = () => {
    setHasUnread(false);
    localStorage.setItem(`lastSeen_${orderId}_${otherUserRole}`, new Date().toISOString());
  };

  return { hasUnread, resetUnread };
}
