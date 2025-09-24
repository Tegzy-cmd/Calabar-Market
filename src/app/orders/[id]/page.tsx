
'use client';

import { getOrderById } from "@/lib/data";
import { notFound, useParams } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Phone, Clock, Truck, Store, CheckCircle, Package, CircleDot, MessageSquare, Star } from "lucide-react";
import { AppHeader } from "@/components/shared/header";
import { cn } from "@/lib/utils";
import type { OrderStatus, Order as OrderType } from "@/lib/types";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ChatRoom } from "@/components/shared/chat-room";
import { useUnreadMessages } from '@/hooks/use-unread-messages';

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

const statusTimeline = [
    { status: 'placed', icon: CircleDot, text: 'Order Placed' },
    { status: 'preparing', icon: Package, text: 'Order Preparing' },
    { status: 'dispatched', icon: Truck, text: 'Order Dispatched' },
    { status: 'delivered', icon: CheckCircle, text: 'Order Delivered' },
];


export default function OrderDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [order, setOrder] = useState<OrderType | null>(null);
  const [isVendorChatOpen, setIsVendorChatOpen] = useState(false);
  const [isDispatcherChatOpen, setIsDispatcherChatOpen] = useState(false);
  const { hasUnread: hasUnreadVendor, resetUnread: resetUnreadVendor } = useUnreadMessages(id, 'user');
  const { hasUnread: hasUnreadDispatcher, resetUnread: resetUnreadDispatcher } = useUnreadMessages(id, 'user');
  
  useEffect(() => {
    if (id) {
        getOrderById(id).then(setOrder);
    }
  }, [id]);

  const handleOpenVendorChat = () => {
    setIsVendorChatOpen(true);
    resetUnreadVendor();
  }

  const handleOpenDispatcherChat = () => {
    setIsDispatcherChatOpen(true);
    resetUnreadDispatcher();
  }

  if (!order) {
    // You might want a better loading state here
    return <div>Loading...</div>;
  }
  
  const currentStatusIndex = statusTimeline.findIndex(item => item.status === order.status);

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
       <ChatRoom 
        orderId={order.id}
        userRole="user"
        isOpen={isVendorChatOpen}
        onOpenChange={setIsVendorChatOpen}
        title={`Chat with ${order.vendor.name}`}
      />
      {order.dispatcher && (
        <ChatRoom 
            orderId={order.id}
            userRole="dispatcher"
            isOpen={isDispatcherChatOpen}
            onOpenChange={setIsDispatcherChatOpen}
            title={`Chat with ${order.dispatcher.name}`}
        />
      )}
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
            <div>
            <h1 className="text-3xl font-headline font-bold">Order #{id.substring(0,7)}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" /> Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
            </div>
            <div className="flex items-center gap-4">
                 <Button variant="outline" onClick={handleOpenVendorChat} className="relative">
                    {hasUnreadVendor && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                        </span>
                    )}
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Chat with Vendor
                </Button>
                {order.status === 'dispatched' && order.dispatcher && (
                    <Button variant="outline" onClick={handleOpenDispatcherChat} className="relative">
                        {hasUnreadDispatcher && (
                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                            </span>
                        )}
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Chat with Dispatcher
                    </Button>
                )}
                <Badge className={cn("capitalize text-lg py-1 px-4 text-white", getStatusColor(order.status))}>{order.status}</Badge>
            </div>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-8">
             <Card>
                <CardHeader>
                    <CardTitle>Order Progress</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex justify-between">
                        {statusTimeline.map((item, index) => {
                            const isActive = index <= currentStatusIndex;
                            const isCompleted = index < currentStatusIndex;
                            return (
                                <div key={item.status} className="flex-1 text-center">
                                    <div className="flex items-center justify-center">
                                        <div className={cn("flex-1 h-1", index === 0 ? 'bg-transparent' : 'bg-border', {'bg-primary': isCompleted })}></div>
                                        <div className={cn("h-10 w-10 rounded-full flex items-center justify-center bg-muted border-2", { "bg-primary text-primary-foreground border-primary": isActive })}>
                                            <item.icon className="w-5 h-5"/>
                                        </div>
                                        <div className={cn("flex-1 h-1", index === statusTimeline.length - 1 ? 'bg-transparent' : 'bg-border', {'bg-primary': isCompleted || (isActive && index === statusTimeline.length -2) })}></div>
                                    </div>
                                    <p className={cn("text-sm mt-2 text-muted-foreground", { "text-foreground font-medium": isActive })}>{item.text}</p>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                </CardHeader>
                <CardContent>
                <ul className="space-y-4">
                    {order.items.map(item => (
                    <li key={item.product.id} className="flex items-center gap-4">
                        <Image
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        width={64}
                        height={64}
                        className="rounded-md object-cover"
                        />
                        <div className="flex-1">
                        <p className="font-semibold">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">Quantity: {item.quantity}</p>
                        </div>
                        <p className="font-semibold">₦{(item.product.price * item.quantity).toFixed(2)}</p>
                    </li>
                    ))}
                </ul>
                <Separator className="my-6" />
                <div className="space-y-2 text-right">
                    <p>Subtotal: <span className="font-semibold">₦{order.subtotal.toFixed(2)}</span></p>
                    <p>Delivery Fee: <span className="font-semibold">₦{order.deliveryFee.toFixed(2)}</span></p>
                    <p className="text-xl font-bold">Total: <span className="text-primary">₦{order.total.toFixed(2)}</span></p>
                </div>
                </CardContent>
            </Card>
            </div>

            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Vendor</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-3">
                            <Store className="w-5 h-5 text-muted-foreground"/>
                            <span className="font-medium">{order.vendor.name}</span>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                         <div className="flex items-center gap-3">
                            <MapPin className="w-5 h-5 text-muted-foreground"/>
                            <span className="text-sm">{order.deliveryAddress}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <User className="w-5 h-5 text-muted-foreground"/>
                            <span className="font-medium">{order.user.name}</span>
                        </div>
                        {order.user.phoneNumber && (
                            <div className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-muted-foreground"/>
                                <span className="text-sm">{order.user.phoneNumber}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {order.dispatcher && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Dispatcher</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Image src={order.dispatcher.avatarUrl} alt={order.dispatcher.name} width={60} height={60} className="rounded-full border-2 border-primary" />
                                <div className="flex-1">
                                    <p className="font-bold text-lg">{order.dispatcher.name}</p>
                                    <p className="text-sm text-muted-foreground capitalize">{order.dispatcher.vehicle}</p>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-500">
                                    <Star className="w-5 h-5 fill-current" />
                                    <span className="font-bold text-base">{order.dispatcher.rating.toFixed(1)}</span>
                                </div>
                            </div>
                            {order.dispatcher.phoneNumber && (
                                <div className="flex items-center gap-3 pt-2 border-t mt-4">
                                    <Phone className="w-5 h-5 text-muted-foreground"/>
                                    <a href={`tel:${order.dispatcher.phoneNumber}`} className="text-sm text-primary hover:underline">{order.dispatcher.phoneNumber}</a>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
        </div>
      </main>
    </div>
  );
}
