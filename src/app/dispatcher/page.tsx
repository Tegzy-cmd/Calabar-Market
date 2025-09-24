
'use client';

import { getServerSession } from "@/lib/auth";
import { getOrdersByDispatcherId } from "@/lib/data";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Order, OrderStatus } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Store } from "lucide-react";
import { OrderStatusUpdater } from "../vendor/orders/_components/order-status-updater";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { db, onSnapshot, query, where, collection, processOrderDoc } from "@/lib/firebase";


const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'delivered':
            return 'bg-green-500 hover:bg-green-600';
        case 'dispatched':
            return 'bg-blue-500 hover:bg-blue-600';
        case 'preparing':
            return 'bg-orange-500 hover:bg-orange-600 text-white';
        case 'placed':
            return 'bg-gray-500 hover:bg-gray-600';
        case 'cancelled':
            return 'bg-red-500 hover:bg-red-600';
        default:
            return '';
    }
}

export default function DispatcherDashboardPage() {
    const { appUser, loading } = useAuth();
    const [orders, setOrders] = useState<Order[]>([]);

    useEffect(() => {
        if (loading) return;

        if (!appUser || appUser.role !== 'dispatcher' || !appUser.dispatcherId) {
            redirect('/login');
            return;
        }

        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('dispatcherId', '==', appUser.dispatcherId));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const fetchedOrders: Order[] = await Promise.all(
                snapshot.docs.map(doc => processOrderDoc(doc))
            );
            setOrders(fetchedOrders);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [appUser, loading]);


    if (loading) {
        return <p>Loading dashboard...</p>
    }

    const activeOrders = orders.filter(o => o.status === 'dispatched' || o.status === 'preparing' || o.status === 'placed');

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">My Delivery Tasks</h1>
            <p className="text-muted-foreground">Here are the orders currently assigned to you for delivery.</p>

            <Card>
                <CardHeader>
                    <CardTitle>Active Deliveries ({activeOrders.length})</CardTitle>
                    <CardDescription>These orders are in progress.</CardDescription>
                </CardHeader>
                <CardContent>
                   {activeOrders.length > 0 ? (
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Order ID</TableHead>
                                <TableHead>Vendor</TableHead>
                                <TableHead>Delivery Address</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {activeOrders.map((order: Order) => (
                                <TableRow key={order.id}>
                                    <TableCell className="font-medium">#{order.id.substring(0, 7)}</TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <Store className="w-4 h-4 text-muted-foreground" />
                                            {order.vendor.name}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-muted-foreground" />
                                            {order.deliveryAddress}
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge className={cn("capitalize text-white", getStatusColor(order.status))}>
                                            {order.status}
                                        </Badge>
                                    </TableCell>
                                     <TableCell className="text-right">
                                        <OrderStatusUpdater order={order} role="dispatcher" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                   ) : (
                    <div className="text-center py-12 text-muted-foreground">
                        <p>You have no active deliveries at the moment.</p>
                    </div>
                   )}
                </CardContent>
            </Card>
        </div>
    )
}
