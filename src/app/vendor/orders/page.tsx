

import { getServerSession } from "@/lib/auth";
import { getOrdersByVendorId } from "@/lib/data";
import { redirect } from "next/navigation";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { OrderList } from "./_components/order-list";


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
                 <OrderList orders={orders} />
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
