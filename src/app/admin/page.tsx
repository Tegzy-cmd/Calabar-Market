
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
import { Users, Store, ShoppingCart, DollarSign } from "lucide-react";
import { getAllOrders, getUsers, getVendors } from "@/lib/data";
import type { Order } from "@/lib/types";
import { OverviewChart } from "./_components/overview-chart";

export default async function AdminDashboardPage() {
  const orders = await getAllOrders();
  const users = await getUsers();
  const vendors = await getVendors();

  const totalUsers = users.length;
  const totalVendors = vendors.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const recentOrders = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Admin Dashboard</h1>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description="+20.1% from last month"
        />
        <StatCard
          title="Total Users"
          value={`+${totalUsers.toLocaleString()}`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          description="+180.1% from last month"
        />
        <StatCard
          title="Total Vendors"
          value={`+${totalVendors.toLocaleString()}`}
          icon={<Store className="h-4 w-4 text-muted-foreground" />}
          description="+19% from last month"
        />
        <StatCard
          title="Total Orders"
          value={`+${totalOrders.toLocaleString()}`}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="+2% from last month"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              You have {orders.length} orders in total.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Vendor</TableHead>
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
                        {order.user.email}
                      </div>
                    </TableCell>
                    <TableCell>{order.vendor.name}</TableCell>
                    <TableCell className="text-right">${order.total.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === "delivered" ? "default" : "secondary"}>
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
    </div>
  );
}

function StatCard({ title, value, icon, description }: { title: string, value: string, icon: React.ReactNode, description: string }) {
    return (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{title}</CardTitle>
            {icon}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
    )
}
