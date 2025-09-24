
import { getVendors } from "@/lib/data";
import type { Vendor } from "@/lib/types";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { VendorActions } from "./_components/vendor-actions";
import { VendorTable } from "./_components/vendor-table";

export default async function AdminVendorsPage() {
  const vendors = await getVendors(undefined, true);

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
                <CardDescription>A list of all vendors in the system. Click a row to see its products.</CardDescription>
            </CardHeader>
            <CardContent>
                <VendorTable vendors={vendors} />
            </CardContent>
        </Card>
    </div>
  );
}
