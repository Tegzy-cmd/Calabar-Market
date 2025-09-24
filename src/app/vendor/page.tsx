
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
import { DollarSign, ShoppingCart, PackageCheck } from "lucide-react";
import { getServerSession } from "@/lib/auth";
import { getOrdersByVendorId } from "@/lib/data";
import type { Order, OrderStatus, Product } from "@/lib/types";
import { cn } from "@/lib/utils";
import { redirect } from "next/navigation";
import { SalesOverview } from "@/app/admin/_components/sales-overview";

function StatCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description?: string }) {
    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold truncate">{value}</div>
            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </CardContent>
        </Card>
    )
}

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

export default async function VendorDashboardPage() {
  const session = await getServerSession();
  
  if (!session || !session.vendorId) {
    // This should be handled by middleware, but as a safeguard
    redirect('/login');
  }

  const orders = await getOrdersByVendorId(session.vendorId);

  const totalRevenue = orders.reduce((sum, order) => {
    return order.status === 'delivered' ? sum + order.total : sum;
  }, 0);

  const totalOrders = orders.length;

  const recentOrders = orders.slice(0, 5);

  const productSales = new Map<string, { name: string, sales: number, quantity: number }>();
  for (const order of orders) {
      if(order.status !== 'delivered') continue;

      for (const item of order.items) {
          const product = item.product;
          const existing = productSales.get(product.id);
          if (existing) {
              existing.sales += item.quantity * product.price;
              existing.quantity += item.quantity;
          } else {
              productSales.set(product.id, {
                  name: product.name,
                  sales: item.quantity * product.price,
                  quantity: item.quantity,
              });
          }
      }
  }

  const topProducts = [...productSales.entries()]
    .sort((a, b) => b[1].quantity - a[1].quantity)
    .slice(0, 5)
    .map(entry => entry[1]);


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Dashboard</h1>

       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={`₦${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="From delivered orders"
        />
        <StatCard
          title="Total Orders"
          value={totalOrders.toLocaleString()}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="Across all statuses"
        />
        <StatCard
          title="Top Selling Product"
          value={topProducts[0]?.name || 'N/A'}
          icon={<PackageCheck className="h-4 w-4 text-muted-foreground" />}
          description={topProducts[0] ? `${topProducts[0].quantity} units sold` : ''}
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <SalesOverview orders={orders} />
        
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Top Products</CardTitle>
            <CardDescription>Your best-selling products by units sold.</CardDescription>
          </CardHeader>
          <CardContent>
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead className="text-right">Units Sold</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {topProducts.map((product) => (
                        <TableRow key={product.name}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell className="text-right">{product.quantity}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>Your 5 most recent orders.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map((order: Order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-medium">{order.user.name}</div>
                      <div className="text-sm text-muted-foreground">
                        #{order.id.substring(0, 7)}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">₦{order.total.toFixed(2)}</TableCell>
                    <TableCell>
                       <Badge 
                        className={cn("capitalize text-white", getStatusColor(order.status))}
                      >
                        {order.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
    </div>
  );
}
