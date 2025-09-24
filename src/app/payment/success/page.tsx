
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getOrderById } from '@/lib/data';
import type { Order } from '@/lib/types';
import { AppHeader } from '@/components/shared/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CheckCircle2, Home } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from '@/components/ui/skeleton';

function SuccessPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get('orderId');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) {
      router.push('/');
      return;
    }

    const fetchOrder = async () => {
      setLoading(true);
      try {
        const fetchedOrder = await getOrderById(orderId);
        if (fetchedOrder) {
          setOrder(fetchedOrder);
        } else {
          setError('Could not find the order details.');
        }
      } catch (err) {
        setError('An error occurred while fetching your order.');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);
  
  if (loading) {
      return <InvoiceSkeleton />
  }

  if (error || !order) {
      return (
          <div className="text-center">
              <p className="text-destructive">{error || "Something went wrong."}</p>
               <Button variant="outline" className="mt-4" asChild>
                    <Link href="/">
                        <Home className="mr-2" /> Go to Homepage
                    </Link>
                </Button>
          </div>
      )
  }

  return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center space-y-2">
            <CheckCircle2 className="mx-auto h-12 w-12 text-green-500" />
            <CardTitle className="text-2xl">Payment Successful!</CardTitle>
            <CardDescription>
                Your order has been placed. Thank you for your purchase.
                <br />
                Order ID: <span className="font-mono text-primary">#{order.id.substring(0, 7)}</span>
            </CardDescription>
        </CardHeader>
        <CardContent>
            <Separator className="my-4" />
            <div className="space-y-4">
                <h3 className="font-semibold text-lg">Order Summary</h3>
                <ul className="space-y-3">
                    {order.items.map(item => (
                        <li key={item.product.id} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Image src={item.product.imageUrl} alt={item.product.name} width={48} height={48} className="rounded-md" />
                                <div>
                                    <p className="font-medium">{item.product.name}</p>
                                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                                </div>
                            </div>
                            <p>₦{(item.quantity * item.product.price).toFixed(2)}</p>
                        </li>
                    ))}
                </ul>
                <Separator />
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>₦{order.subtotal.toFixed(2)}</span>
                    </div>
                     <div className="flex justify-between">
                        <span className="text-muted-foreground">Delivery Fee</span>
                        <span>₦{order.deliveryFee.toFixed(2)}</span>
                    </div>
                </div>
                 <Separator />
                 <div className="flex justify-between font-bold text-lg">
                    <span>Total Paid</span>
                    <span>₦{order.total.toFixed(2)}</span>
                </div>
            </div>
            <Separator className="my-4" />
            <div className="space-y-2">
                <h3 className="font-semibold">Delivery To:</h3>
                <p className="text-muted-foreground text-sm">{order.deliveryAddress}</p>
            </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-4">
            <Button className="w-full" asChild>
                <Link href={`/orders/${order.id}`}>View Order Progress</Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
                <Link href="/browse">Continue Shopping</Link>
            </Button>
        </CardFooter>
      </Card>
  );
}


function InvoiceSkeleton() {
    return (
        <Card className="w-full max-w-2xl mx-auto">
            <CardHeader className="text-center space-y-2">
                 <Skeleton className="h-12 w-12 rounded-full mx-auto" />
                 <Skeleton className="h-8 w-1/2 mx-auto" />
                 <Skeleton className="h-4 w-3/4 mx-auto" />
            </CardHeader>
            <CardContent className="space-y-4">
                <Separator />
                <Skeleton className="h-6 w-1/4 mb-4" />
                <div className="space-y-3">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Skeleton className="h-12 w-12 rounded-md" />
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-3 w-16" />
                                </div>
                            </div>
                            <Skeleton className="h-5 w-20" />
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                </div>
                <Separator />
                <Skeleton className="h-8 w-full" />
            </CardContent>
             <CardFooter className="flex gap-4">
                 <Skeleton className="h-10 w-full" />
                 <Skeleton className="h-10 w-full" />
             </CardFooter>
        </Card>
    )
}

export default function PaymentSuccessPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <AppHeader />
            <main className="flex-1 bg-muted/40 py-8 sm:py-12 md:py-16">
                <div className="container">
                    <Suspense fallback={<InvoiceSkeleton />}>
                        <SuccessPageContent />
                    </Suspense>
                </div>
            </main>
        </div>
    )
}
