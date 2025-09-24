
import { getServerSession } from "@/lib/auth";
import { getOrdersByVendorId } from "@/lib/data";
import { redirect } from "next/navigation";
import type { Order, OrderStatus } from "@/lib/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { OrderStatusUpdater } from "./_components/order-status-updater";


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

export default async function VendorOrdersPage() {
    const session = await getServerSession();

    if (!session || !session.vendorId) {
        redirect('/login');
    }

    const orders = await getOrdersByVendorId(session.vendorId);
    
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-bold">Orders</h1>
        <Card>
            <CardHeader>
                <CardTitle>All Orders ({orders.length})</CardTitle>
                <CardDescription>A list of all orders from your customers.</CardDescription>
            </CardHeader>
            <CardContent>
               {orders.length > 0 ? (
                 <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order ID</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead><span className="sr-only">Actions</span></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order: Order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-medium">
                                    <Link href={`/vendor/orders/${order.id}`} className="text-primary hover:underline">
                                       #{order.id.substring(0, 7)}
                                    </Link>
                                </TableCell>
                                <TableCell>{order.user.name}</TableCell>
                                <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                                <TableCell>₦{order.total.toFixed(2)}</TableCell>
                                <TableCell>
                                    <Badge className={cn("capitalize text-white", getStatusColor(order.status))}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <OrderStatusUpdater order={order} role="vendor" />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
               ) : (
                <div className="text-center py-12 text-muted-foreground">
                    <p>You have no orders yet.</p>
                </div>
               )}
            </CardContent>
        </Card>
      </div>
    );
}
