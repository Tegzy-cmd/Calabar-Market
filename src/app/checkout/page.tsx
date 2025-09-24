
'use client';

import { AppHeader } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/hooks/use-cart';
import Image from 'next/image';
import Link from 'next/link';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getUserById } from '@/lib/data';
import type { User } from '@/lib/types';
import { updateUser } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';


export default function CheckoutPage() {
  const { items, total, setDeliveryAddress } = useCart();
  const { user: authUser, loading, appUser: initialAppUser, syncUser } = useAuth();
  const [appUser, setAppUser] = useState<User | null>(initialAppUser);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  
  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login?redirect=/checkout');
    }
    
    const fetchUser = async () => {
        if (authUser) {
            const user = await getUserById(authUser.uid);
            setAppUser(user);
        }
    }
    if (!appUser) {
        fetchUser();
    }

  }, [authUser, loading, router, appUser]);

  useEffect(() => {
    if (appUser) {
        setName(appUser.name || '');
        setEmail(appUser.email || '');
        setPhone(appUser.phoneNumber || '');
        if (appUser.addresses && appUser.addresses.length > 0) {
            setSelectedAddress(appUser.addresses[0]);
        }
    }
  }, [appUser]);
  
  const handleProceedToPayment = () => {
      startTransition(async () => {
        if (!appUser) {
            toast({ title: "Error", description: "You must be logged in.", variant: "destructive"});
            return;
        }

        const userData = {
            name,
            email,
            phoneNumber: phone,
            addresses: [selectedAddress]
        };

        const result = await updateUser(appUser.id, userData);

        if (result.success) {
            if (authUser) {
                // re-sync the user to update the appUser state locally
               await syncUser(authUser);
            }
            setDeliveryAddress(selectedAddress);
            router.push('/payment');
        } else {
            toast({ title: 'Error', description: result.error, variant: 'destructive'});
        }
      });
  }


  if (loading || !authUser || !appUser) {
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 container mx-auto px-4 md:px-6 py-8 text-center">
                <p>Loading...</p>
            </main>
        </div>
    )
  }

  if (items.length === 0) {
    return (
        <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8 text-center">
            <h1 className="text-3xl font-bold font-headline mb-8">Checkout</h1>
            <p className="text-xl text-muted-foreground mb-4">Your cart is empty. Add some items to proceed.</p>
            <Button asChild>
                <Link href="/browse">Start Shopping</Link>
            </Button>
        </main>
        </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold font-headline mb-8">Checkout</h1>
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Delivery Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    {(appUser.addresses && appUser.addresses.length > 0 && appUser.addresses[0]) ? (
                        <Select value={selectedAddress} onValueChange={setSelectedAddress}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select an address" />
                            </SelectTrigger>
                            <SelectContent>
                                {appUser.addresses.map((address, index) => (
                                    <SelectItem key={index} value={address}>{address}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    ) : (
                         <Input id="address" placeholder="123 Main St, Calabar, Nigeria" value={selectedAddress} onChange={(e) => setSelectedAddress(e.target.value)} />
                    )}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </Header>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {items.map(item => (
                        <li key={item.id} className="flex justify-between items-center">
                            <span>{item.name} x {item.quantity}</span>
                            <span>₦{(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <Separator />
                 <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>₦{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>₦500.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₦{(total + 500.00).toFixed(2)}</span>
                  </div>
              </CardContent>
            </Card>
            <Button className="w-full" size="lg" onClick={handleProceedToPayment} disabled={isPending}>
              {isPending ? 'Saving...' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
