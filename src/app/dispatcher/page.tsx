

'use client';

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { redirect } from "next/navigation";
import { db, onSnapshot, query, where, collection } from "@/lib/firebase";
import { processOrderDoc } from "@/lib/data";
import type { Order, OrderStatus } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { MapPin, Store, Check, Bike, Star, Wallet, MessageSquare } from "lucide-react";
import { OrderStatusUpdater } from "../vendor/orders/_components/order-status-updater";
import { isToday, parseISO } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useUnreadMessages } from "@/hooks/use-unread-messages";
import { ChatRoom } from "@/components/shared/chat-room";

const getStatusColor = (status: OrderStatus) => {
    switch (status) {
        case 'delivered':
            return 'bg-green-500 hover:bg-green-600';
        case 'dispatched':
            return 'bg-blue-500 hover:bg-blue-600';
        case 'preparing':
        case 'awaiting-confirmation':
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
    const [chatOrder, setChatOrder] = useState<Order | null>(null);
    const { toast } = useToast();
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    useEffect(() => {
        if (loading) return;

        if (!appUser || appUser.role !== 'dispatcher') {
            redirect('/login');
            return;
        }

        if (!appUser.dispatcherId) return;

        const ordersRef = collection(db, 'orders');
        const q = query(
            ordersRef, 
            where('dispatcherId', '==', appUser.dispatcherId),
            where('status', 'in', ['preparing', 'dispatched', 'placed', 'awaiting-confirmation'])
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const fetchedOrders: Order[] = await Promise.all(
                snapshot.docs.map(doc => processOrderDoc(doc))
            );
            
            const sortedOrders = fetchedOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            // Check for new assignments on subsequent snapshots
            if (!isInitialLoad) {
                const newAssignments = sortedOrders.filter(newOrder => 
                    !orders.some(oldOrder => oldOrder.id === newOrder.id) && (newOrder.status === 'preparing' || newOrder.status === 'placed')
                );

                if (newAssignments.length > 0) {
                    toast({
                        title: "New Delivery Task!",
                        description: `You have been assigned a new order #${newAssignments[0].id.substring(0,7)} from ${newAssignments[0].vendor.name}.`,
                    });
                }
            }
            
            setOrders(sortedOrders);
            setIsInitialLoad(false);
        });

        // Cleanup subscription on unmount
        return () => unsubscribe();
    }, [appUser, loading, toast, orders, isInitialLoad]);


    if (loading || !appUser || !appUser.dispatcherId) {
        return <p>Loading dashboard...</p>
    }

    const activeOrders = orders.filter(o => o.status === 'dispatched' || o.status === 'preparing' || o.status === 'awaiting-confirmation');
    const completedOrders = orders.filter(o => o.status === 'delivered');
    const completedToday = completedOrders.filter(o => isToday(parseISO(o.createdAt))).length;
    const earningsToday = completedToday * 300; // Assume ₦300 per delivery
    
    // Recalculate average rating from completed orders that have a rating
    const ratedOrders = completedOrders.filter(o => o.dispatcherRating && o.dispatcherRating > 0);
    const averageRating = ratedOrders.length > 0
        ? ratedOrders.reduce((acc, o) => acc + (o.dispatcherRating || 0), 0) / ratedOrders.length
        : appUser.dispatcher?.rating || 5;


    return (
        <div className="space-y-8">
            {chatOrder && (
                <ChatRoom 
                    orderId={chatOrder.id}
                    currentUserRole="dispatcher"
                    otherUserRole="user"
                    isOpen={!!chatOrder}
                    onOpenChange={() => setChatOrder(null)}
                    title={`Chat with ${chatOrder.user.name}`}
                />
            )}
            <h1 className="text-3xl font-headline font-bold">My Dashboard</h1>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <StatCard 
                    title="Active Deliveries"
                    value={activeOrders.length}
                    icon={<Bike className="h-4 w-4 text-muted-foreground" />}
                    description="Orders you are currently handling."
                />
                <StatCard 
                    title="Completed Today"
                    value={completedToday}
                    icon={<Check className="h-4 w-4 text-muted-foreground" />}
                    description="Deliveries you've completed today."
                />
                <StatCard 
                    title="Earnings Today"
                    value={`₦${earningsToday.toLocaleString()}`}
                    icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
                    description="Based on deliveries completed today."
                />
                <StatCard 
                    title="Your Rating"
                    value={averageRating.toFixed(1)}
                    icon={<Star className="h-4 w-4 text-muted-foreground" />}
                    description="Your current average customer rating."
                />
            </div>
            
            <Tabs defaultValue="active">
                <TabsList>
                    <TabsTrigger value="active">Active Deliveries ({activeOrders.length})</TabsTrigger>
                    <TabsTrigger value="completed">Completed Deliveries ({completedOrders.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="active">
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Deliveries</CardTitle>
                            <CardDescription>These orders are in progress. Update the status as you complete each step.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {activeOrders.length > 0 ? (
                             <OrderTable orders={activeOrders} onChatOpen={setChatOrder} />
                           ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>You have no active deliveries at the moment.</p>
                            </div>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="completed">
                     <Card>
                        <CardHeader>
                            <CardTitle>Completed Deliveries</CardTitle>
                            <CardDescription>A history of all your completed deliveries.</CardDescription>
                        </CardHeader>
                        <CardContent>
                           {completedOrders.length > 0 ? (
                             <OrderTable orders={completedOrders} onChatOpen={setChatOrder} />
                           ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <p>You have not completed any deliveries yet.</p>
                            </div>
                           )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}


function OrderTable({ orders, onChatOpen }: { orders: Order[], onChatOpen: (order: Order) => void }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vendor</TableHead>
                    <TableHead>Delivery Address</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order: Order) => (
                    <OrderTableRow key={order.id} order={order} onChatOpen={onChatOpen} />
                ))}
            </TableBody>
        </Table>
    )
}

function OrderTableRow({ order, onChatOpen }: { order: Order, onChatOpen: (order: Order) => void }) {
    const { hasUnread, resetUnread } = useUnreadMessages(order.id, 'user');

    const handleOpenChat = () => {
        onChatOpen(order);
        resetUnread();
    }
    
    return (
        <TableRow>
            <TableCell className="font-medium">#{order.id.substring(0, 7)}</TableCell>
            <TableCell>{order.user.name}</TableCell>
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
                    {order.status.replace('-', ' ')}
                </Badge>
            </TableCell>
                <TableCell className="text-right flex items-center justify-end space-x-2">
                {(order.status === 'dispatched' || order.status === 'awaiting-confirmation') && (
                    <Button variant="outline" size="sm" onClick={handleOpenChat} className="relative">
                        {hasUnread && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat
                    </Button>
                )}
                <OrderStatusUpdater order={order} role="dispatcher" />
            </TableCell>
        </TableRow>
    );
}

function StatCard({ title, value, icon, description }: { title: string, value: string | number, icon: React.ReactNode, description: string }) {
    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
    )
}

    