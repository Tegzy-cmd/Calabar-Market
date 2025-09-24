
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppHeader } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { CreditCard, Lock, Calendar, AlertCircle, Loader } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useAuth } from '@/hooks/use-auth';
import { createOrder } from '@/lib/actions';

export default function PaymentPage() {
  const { items, total, clearCart, deliveryAddress } = useCart();
  const { appUser } = useAuth();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const grandTotal = total > 0 ? total + 500.00 : 0; // Including delivery fee

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!appUser || items.length === 0) {
        setError("User not authenticated or cart is empty.");
        return;
    }

    if (!deliveryAddress) {
        setError("No delivery address selected. Please go back to checkout.");
        return;
    }


    setIsProcessing(true);
    setError(null);

    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000));

    const orderData = {
        userId: appUser.id,
        items: items.map(item => ({ productId: item.id, quantity: item.quantity, price: item.price })),
        subtotal: total,
        deliveryFee: 500.00,
        total: grandTotal,
        deliveryAddress: deliveryAddress,
        vendorId: items[0].vendorId,
    }

    const result = await createOrder(orderData);

    if (result.success && result.orderId) {
        clearCart();
        router.push(`/payment/success?orderId=${result.orderId}`);
    } else {
        setError(result.error || 'Failed to create order.');
        setIsProcessing(false);
    }
  };


  if (grandTotal === 0 && !isProcessing) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
            <div className="max-w-md mx-auto text-center">
                 <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                 <p className="text-muted-foreground mb-6">Add items to your cart before proceeding to payment.</p>
                 <Button onClick={() => router.push('/browse')}>Start Shopping</Button>
            </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Complete Your Payment</CardTitle>
              <CardDescription>
                Enter your card details to finalize your order. Total amount is <strong>₦{grandTotal.toFixed(2)}</strong>.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                 {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Payment Error</AlertTitle>
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input id="cardNumber" placeholder="0000 0000 0000 0000" className="pl-10" required defaultValue="4242 4242 4242 4242" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiry">Expiry Date</Label>
                    <div className="relative">
                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="expiry" placeholder="MM/YY" className="pl-10" required defaultValue="12/25" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvc">CVC</Label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="cvc" placeholder="123" className="pl-10" required defaultValue="123" />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    `Pay ₦${grandTotal.toFixed(2)}`
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}
