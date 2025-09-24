
'use client';

import { useEffect, useState } from 'react';
import { AppHeader } from '@/components/shared/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { getOrdersByUserId } from '@/lib/data';
import type { Order } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { cn, getOrderStatusVariant } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/orders');
    }

    if (user) {
      const fetchOrders = async () => {
        setLoading(true);
        const userOrders = await getOrdersByUserId(user.uid);
        setOrders(userOrders);
        setLoading(false);
      };
      fetchOrders();
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
            <h1 className="text-3xl font-bold font-headline mb-8">My Orders</h1>
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-1/4" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
            </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <h1 className="text-3xl font-bold font-headline mb-8">My Orders</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Order History</CardTitle>
            <CardDescription>A list of all your past orders.</CardDescription>
          </CardHeader>
          <CardContent>
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't placed any orders yet.</p>
                <Button asChild>
                  <Link href="/browse">Start Shopping</Link>
                </Button>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Vendor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">#{order.id.substring(0, 7)}</TableCell>
                    <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>{order.vendor.name}</TableCell>
                    <TableCell>₦{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                       <Badge variant={getOrderStatusVariant(order.status)} className={cn("capitalize")}>
                        {order.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="outline" size="sm" asChild>
                          <Link href={`/orders/${order.id}`}>View Details</Link>
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

    