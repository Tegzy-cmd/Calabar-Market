
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
import { Users, Store, ShoppingCart, DollarSign, Crown, PackageCheck, Utensils, Carrot } from "lucide-react";
import { getAllOrders, getUsers, getVendors, getProductById, getVendorById } from "@/lib/data";
import type { Order, Vendor, Product } from "@/lib/types";
import { OverviewChart } from "./_components/overview-chart";
import { CategoryChart } from "./_components/category-chart";

export default async function AdminDashboardPage() {
  const orders = await getAllOrders();
  const users = await getUsers();
  const vendors = await getVendors();

  const totalUsers = users.length;
  const totalVendors = vendors.length;
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  const recentOrders = orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

  // --- Detailed Analytics ---

  // Sales by month for OverviewChart
  const salesByMonth = Array.from({ length: 12 }, (_, i) => ({
    name: new Date(0, i).toLocaleString('default', { month: 'short' }),
    total: 0,
  }));

  orders.forEach(order => {
    const month = new Date(order.createdAt).getMonth();
    salesByMonth[month].total += order.total;
  });
  
  // Sales by category for CategoryChart
  const salesByCategory = { food: 0, groceries: 0 };
  let topVendorStats = new Map<string, { name: string, sales: number }>();
  let topProductStats = new Map<string, { name:string, sales: number }>();

  for(const order of orders) {
    if (order.vendor.category === 'food') {
      salesByCategory.food += order.total;
    } else if (order.vendor.category === 'groceries') {
      salesByCategory.groceries += order.total;
    }

    // Top Vendor Calculation
    const vendorName = order.vendor.name;
    const currentVendorSales = topVendorStats.get(order.vendor.id)?.sales || 0;
    topVendorStats.set(order.vendor.id, { name: vendorName, sales: currentVendorSales + order.total });

    // Top Product Calculation - Note: This is simplified. For accuracy, we should fetch product details for each item.
    // This is a simplified example. In a real-world scenario with many orders, this would be inefficient.
    // A better approach would be to have more comprehensive data fetching or database aggregations.
    for (const item of order.items) {
      const productName = item.product.name;
      const productSales = item.quantity * item.product.price;
      const currentProductSales = topProductStats.get(item.product.id)?.sales || 0;
      topProductStats.set(item.product.id, { name: productName, sales: currentProductSales + productSales });
    }
  }

  const categoryChartData = [
    { name: 'Food', value: salesByCategory.food, fill: "hsl(var(--chart-1))" },
    { name: 'Groceries', value: salesByCategory.groceries, fill: "hsl(var(--chart-2))" },
  ];

  const topVendor = [...topVendorStats.entries()].sort((a, b) => b[1].sales - a[1].sales)[0]?.[1] || { name: 'N/A', sales: 0 };
  const topProduct = [...topProductStats.entries()].sort((a, b) => b[1].sales - a[1].sales)[0]?.[1] || { name: 'N/A', sales: 0 };


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
          title="Total Orders"
          value={`+${totalOrders.toLocaleString()}`}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
          description="+2% from last month"
        />
        <StatCard
          title="Total Vendors"
          value={`+${totalVendors.toLocaleString()}`}
          icon={<Store className="h-4 w-4 text-muted-foreground" />}
          description="+19% from last month"
        />
      </div>
      
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
            title="Top Vendor"
            value={topVendor.name}
            icon={<Crown className="h-4 w-4 text-muted-foreground" />}
            description={`$${topVendor.sales.toFixed(2)} in sales`}
        />
        <StatCard
            title="Top Product"
            value={topProduct.name}
            icon={<PackageCheck className="h-4 w-4 text-muted-foreground" />}
            description={`$${topProduct.sales.toFixed(2)} in sales`}
        />
         <StatCard
            title="Top Category: Food"
            value={`$${salesByCategory.food.toFixed(2)}`}
            icon={<Utensils className="h-4 w-4 text-muted-foreground" />}
            description={`${((salesByCategory.food / totalRevenue) * 100).toFixed(1)}% of total revenue`}
        />
         <StatCard
            title="Top Category: Groceries"
            value={`$${salesByCategory.groceries.toFixed(2)}`}
            icon={<Carrot className="h-4 w-4 text-muted-foreground" />}
            description={`${((salesByCategory.groceries / totalRevenue) * 100).toFixed(1)}% of total revenue`}
        />
       </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Sales Overview</CardTitle>
             <CardDescription>Monthly sales performance.</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <OverviewChart data={salesByMonth} />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              A breakdown of sales between food and groceries.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryChart data={categoryChartData} />
          </CardContent>
        </Card>
      </div>

       <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Your 5 most recent orders.
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
            <div className="text-2xl font-bold truncate">{value}</div>
            <p className="text-xs text-muted-foreground">{description}</p>
          </CardContent>
        </Card>
    )
}

    