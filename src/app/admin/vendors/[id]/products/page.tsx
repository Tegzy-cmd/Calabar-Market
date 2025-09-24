
import { getVendorById } from "@/lib/data";
import { notFound } from "next/navigation";
import Image from "next/image";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@/lib/types";

export default async function VendorProductsPage({ params }: { params: { id: string } }) {
  const vendor = await getVendorById(params.id);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-headline font-bold">Products for {vendor.name}</h1>
        <p className="text-muted-foreground">
          A list of all products sold by this vendor.
        </p>
      </div>

      {vendor.products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {vendor.products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <Card className="flex items-center justify-center p-12">
            <p className="text-muted-foreground">This vendor has not added any products yet.</p>
        </Card>
      )}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="p-0">
        <div className="relative h-48">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-t-lg"
          />
        </div>
      </CardHeader>
      <CardContent className="p-4 flex-1">
        <CardTitle className="text-lg font-headline">{product.name}</CardTitle>
        <CardDescription className="text-sm mt-1 line-clamp-2">
          {product.description}
        </CardDescription>
      </CardContent>
      <CardFooter className="p-4 flex justify-between items-center bg-muted/50">
        <p className="font-semibold text-lg">₦{product.price.toFixed(2)}</p>
        <Badge variant={product.stock > 0 ? "secondary" : "destructive"}>
          {product.stock > 0 ? `${product.stock} in stock` : "Out of Stock"}
        </Badge>
      </CardFooter>
    </Card>
  );
}
