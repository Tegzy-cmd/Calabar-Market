'use client';

import { useEffect, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { AppHeader } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/actions';

export default function CheckoutPage() {
  const { items, total, setDeliveryAddress, deliveryAddress } = useCart();
  const { user: authUser, loading, appUser, syncUser } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedAddress, setSelectedAddress] = useState(deliveryAddress || '');

  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !authUser) {
      router.push('/login?redirect=/checkout');
    }
  }, [authUser, loading, router]);

  // Sync user details
  useEffect(() => {
    if (appUser) {
      setName(appUser.name || '');
      setEmail(appUser.email || '');
      setPhone(appUser.phoneNumber || '');

      if (!deliveryAddress && appUser.addresses?.length > 0) {
        const primary = appUser.addresses[0];
        setSelectedAddress(primary);
        setDeliveryAddress(primary);
      } else if (deliveryAddress) {
        setSelectedAddress(deliveryAddress);
      }
    }
  }, [appUser, deliveryAddress, setDeliveryAddress]);

  const handleProceedToPayment = () => {
    if (!selectedAddress.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a delivery address.',
        variant: 'destructive',
      });
      return;
    }

    startTransition(async () => {
      if (appUser && authUser) {
        const userData = { name, email, phoneNumber: phone, addresses: [selectedAddress] };
        const result = await updateUser(appUser.id, userData);

        if (result.success) {
          await syncUser(authUser);
          setDeliveryAddress(selectedAddress);
          router.push('/payment');
        } else {
          toast({
            title: 'Error',
            description: `Could not save your delivery details. ${result.error}`,
            variant: 'destructive',
          });
        }
      }
    });
  };

  /** --- UI States --- */
  if (loading || !authUser || !appUser) {
    return (
      <PageLayout>
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8 text-center">
          <p>Loading...</p>
        </main>
      </PageLayout>
    );
  }

  if (items.length === 0) {
    return (
      <PageLayout>
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8 text-center">
          <h1 className="text-3xl font-bold font-headline mb-8">Checkout</h1>
          <p className="text-xl text-muted-foreground mb-4">
            Your cart is empty. Add some items to proceed.
          </p>
          <Button asChild>
            <Link href="/browse">Start Shopping</Link>
          </Button>
        </main>
      </PageLayout>
    );
  }

  /** --- Main Checkout UI --- */
  return (
    <PageLayout>
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold font-headline mb-8">Checkout</h1>
        <div className="grid md:grid-cols-3 gap-12 items-start">
          <div className="md:col-span-2">
            <DeliveryForm
              name={name}
              email={email}
              phone={phone}
              selectedAddress={selectedAddress}
              addresses={appUser.addresses || []}
              setName={setName}
              setEmail={setEmail}
              setPhone={setPhone}
              setSelectedAddress={setSelectedAddress}
            />
          </div>
          <div className="md:col-span-1 space-y-6">
            <OrderSummary items={items} total={total} />
            <Button
              className="w-full"
              size="lg"
              onClick={handleProceedToPayment}
              disabled={isPending}
            >
              {isPending ? 'Saving...' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </main>
    </PageLayout>
  );
}

/** --- Subcomponents --- */
function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      {children}
    </div>
  );
}

function DeliveryForm({
  name,
  email,
  phone,
  selectedAddress,
  addresses,
  setName,
  setEmail,
  setPhone,
  setSelectedAddress,
}: any) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Delivery Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Full Name">
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </FormField>
          <FormField label="Email">
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </FormField>
        </div>
        <FormField label="Delivery Address">
          {addresses.length > 1 ? (
            <Select value={selectedAddress} onValueChange={setSelectedAddress}>
              <SelectTrigger>
                <SelectValue placeholder="Select an address" />
              </SelectTrigger>
              <SelectContent>
                {addresses.map((addr: string, i: number) => (
                  <SelectItem key={i} value={addr}>
                    {addr}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="address"
              placeholder="123 Main St, Calabar, Nigeria"
              value={selectedAddress}
              onChange={(e) => setSelectedAddress(e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Phone Number">
          <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>
      </CardContent>
    </Card>
  );
}

function OrderSummary({ items, total }: { items: any[]; total: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="space-y-2 text-sm text-muted-foreground">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between items-center">
              <span>
                {item.name} x {item.quantity}
              </span>
              <span>₦{(item.price * item.quantity).toFixed(2)}</span>
            </li>
          ))}
        </ul>
        <Separator />
        <SummaryRow label="Subtotal" value={`₦${total.toFixed(2)}`} />
        <SummaryRow label="Delivery Fee" value="₦500.00" />
        <Separator />
        <SummaryRow label="Total" value={`₦${(total + 500).toFixed(2)}`} bold />
      </CardContent>
    </Card>
  );
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between ${bold ? 'font-bold text-lg' : ''}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
