
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
import { useEffect } from 'react';

export default function CheckoutPage() {
  const { items, total } = useCart();
  const { user, loading } = useAuth();
  const router = useRouter();
  
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/checkout');
    }
  }, [user, loading, router]);


  if (loading || !user) {
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
  
  const deliveryInfo = {
    name: user.displayName || 'John Doe',
    email: user.email || 'john.doe@example.com',
    address: '123 Main St, Calabar, Nigeria',
    phone: user.phoneNumber || '+234 801 234 5678'
  };


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
                        <Input id="name" defaultValue={deliveryInfo.name} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" type="email" defaultValue={deliveryInfo.email} />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="address">Delivery Address</Label>
                    <Input id="address" defaultValue={deliveryInfo.address} />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue={deliveryInfo.phone} />
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm text-muted-foreground">
                    {items.map(item => (
                        <li key={item.id} className="flex justify-between items-center">
                            <span>{item.name} x {item.quantity}</span>
                            <span>${(item.price * item.quantity).toFixed(2)}</span>
                        </li>
                    ))}
                </ul>
                <Separator />
                 <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee</span>
                    <span>$5.00</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${(total + 5.00).toFixed(2)}</span>
                  </div>
              </CardContent>
            </Card>
            <Button className="w-full" size="lg" asChild>
              <Link href="/payment">Proceed to Payment</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
