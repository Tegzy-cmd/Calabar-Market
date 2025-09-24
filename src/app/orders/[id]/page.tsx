
import { getOrderById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { User, MapPin, Phone, Clock, Truck, Store } from "lucide-react";
import { AppHeader } from "@/components/shared/header";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/lib/types";

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


export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
      <div className="space-y-8">
        <div className="flex justify-between items-start">
            <div>
            <h1 className="text-3xl font-headline font-bold">Order #{params.id.substring(0,7)}</h1>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
                <Clock className="w-4 h-4" /> Placed on {new Date(order.createdAt).toLocaleString()}
            </p>
            </div>
            <Badge className={cn("capitalize text-lg py-1 px-4 text-white", getStatusColor(order.status))}>{order.status}</Badge>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 items-start">
            <div className="md:col-span-2 space-y-8">
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
                            <CardTitle>Dispatcher</CardTitle>
                        </CardHeader>
                        <CardContent className="flex items-center gap-4">
                            <Image src={order.dispatcher.avatarUrl} alt={order.dispatcher.name} width={50} height={50} className="rounded-full" />
                            <div>
                                <p className="font-bold">{order.dispatcher.name}</p>
                                <p className="text-sm text-muted-foreground">{order.dispatcher.vehicle}</p>
                            </div>
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

