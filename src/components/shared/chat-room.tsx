
'use client';

import { useState, useTransition, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import type { ChatMessage, User } from '@/lib/types';
import { getMessages, sendMessage } from '@/lib/actions';
import { Send } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { onSnapshot, collection, query, orderBy } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cn } from '@/lib/utils';
import { ScrollArea } from '../ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface ChatRoomProps {
  orderId: string;
  userRole: 'user' | 'vendor';
  title: string;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function ChatRoom({ orderId, userRole, title, isOpen, onOpenChange }: ChatRoomProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { appUser } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen || !orderId) return;

    const messagesCol = collection(db, `orders/${orderId}/messages`);
    const q = query(messagesCol, orderBy('timestamp', 'asc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
        const newMessages: ChatMessage[] = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            newMessages.push({
                id: doc.id,
                ...data,
                timestamp: data.timestamp?.toDate()?.toISOString() || new Date().toISOString(),
            } as ChatMessage);
        });
        setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [isOpen, orderId]);

  useEffect(() => {
    // Auto-scroll to bottom
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages])

  const handleSendMessage = () => {
    if (!newMessage.trim() || !appUser) return;

    startTransition(async () => {
      const result = await sendMessage({
        orderId,
        text: newMessage,
        senderId: appUser.id,
        senderName: appUser.name,
        senderRole: userRole,
      });

      if (result.success) {
        setNewMessage('');
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  if (!appUser) {
      return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 p-4 -mx-6" ref={scrollAreaRef}>
            <div className="space-y-4 pr-6">
                 {messages.map((message) => {
                    const isSender = message.senderId === appUser.id;
                    return (
                        <div key={message.id} className={cn("flex items-end gap-2", isSender && "justify-end")}>
                            {!isSender && (
                                <Avatar className="h-8 w-8">
                                    <AvatarFallback>{message.senderName[0]}</AvatarFallback>
                                </Avatar>
                            )}
                             <div className="flex flex-col space-y-1">
                                <div className={cn(
                                    "p-3 rounded-lg max-w-xs",
                                    isSender ? "bg-primary text-primary-foreground rounded-br-none" : "bg-muted rounded-bl-none"
                                )}>
                                    <p className="text-sm">{message.text}</p>
                                </div>
                                 <span className={cn("text-xs text-muted-foreground", isSender ? 'text-right' : 'text-left')}>
                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    )
                 })}
            </div>
        </ScrollArea>
        <DialogFooter>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex w-full items-center space-x-2"
          >
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={isPending}
            />
            <Button type="submit" size="icon" disabled={isPending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send Message</span>
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
