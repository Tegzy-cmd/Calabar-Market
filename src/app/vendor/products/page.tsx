import { getServerSession } from "@/lib/auth";
import { getProductsByVendorId } from "@/lib/data";
import { notFound, redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Product } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ProductActions } from "./_components/product-actions";

export default async function VendorProductsPage() {
    const session = await getServerSession();

    if (!session || !session.vendorId) {
        redirect('/login');
    }

    const products = await getProductsByVendorId(session.vendorId);
    
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-headline font-bold">Products</h1>
                    <p className="text-muted-foreground">Manage all products in your store.</p>
                </div>
                <ProductActions vendorId={session.vendorId} />
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>All Products ({products.length})</CardTitle>
                    <CardDescription>A list of all products in your store.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Image</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Price</TableHead>
                                <TableHead>Stock</TableHead>
                                <TableHead>
                                    <span className="sr-only">Actions</span>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {products.map((product: Product) => (
                                <TableRow key={product.id}>
                                    <TableCell>
                                        <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                                    </TableCell>
                                    <TableCell className="font-medium">{product.name}</TableCell>
                                    <TableCell>₦{product.price.toFixed(2)}</TableCell>
                                    <TableCell>
                                        <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
                                            {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex justify-end">
                                            <ProductActions product={product} vendorId={session.vendorId!} />
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
