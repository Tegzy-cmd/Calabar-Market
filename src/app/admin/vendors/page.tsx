
import { getVendors } from "@/lib/data";
import type { Vendor } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VendorActions } from "./_components/vendor-actions";

export default async function AdminVendorsPage() {
  const vendors = await getVendors();

  return (
    <div className="space-y-8">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-headline font-bold">Vendors</h1>
                <p className="text-muted-foreground">Manage all vendors in the system.</p>
            </div>
            <VendorActions />
        </div>
      
        <Card>
            <CardHeader>
                <CardTitle>All Vendors ({vendors.length})</CardTitle>
                <CardDescription>A list of all vendors in the system.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Vendor</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>
                            <span className="sr-only">Actions</span>
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {vendors.map((vendor: Vendor) => (
                    <TableRow key={vendor.id}>
                        <TableCell>
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={vendor.logoUrl} alt={vendor.name} />
                                    <AvatarFallback>{vendor.name ? vendor.name[0] : 'V'}</AvatarFallback>
                                </Avatar>
                                <div className="font-medium">
                                    <p>{vendor.name}</p>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell>
                           <Badge variant="outline" className="capitalize">{vendor.category}</Badge>
                        </TableCell>
                        <TableCell>
                            <div className="flex justify-end">
                                <VendorActions vendor={vendor} />
                            </div>
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
