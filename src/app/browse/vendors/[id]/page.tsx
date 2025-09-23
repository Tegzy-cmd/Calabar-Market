
import Image from 'next/image';
import { getVendorById } from '@/lib/data';
import type { Product, Vendor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AppHeader } from '@/components/shared/header';
import { notFound } from 'next/navigation';
import { PlusCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { AddToCartButton } from './_components/add-to-cart-button';

export default async function VendorDetailPage({ params }: { params: { id: string }}) {
  const id = params.id;
  const vendor = await getVendorById(id);

  if (!vendor) {
    notFound();
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main>
        <div className="relative h-48 md:h-64 w-full">
            <Image 
                src={vendor.bannerUrl}
                alt={`${vendor.name} banner`}
                fill
                className="object-cover"
                priority
            />
            <div className="absolute inset-0 bg-black/30" />
        </div>
        <div className="container mx-auto px-4 md:px-6 -mt-16 md:-mt-24 pb-16">
            <div className="bg-card rounded-lg shadow-lg p-6 flex flex-col md:flex-row items-start gap-6">
                <div className="relative h-32 w-32 rounded-full border-4 border-card bg-card shadow-md flex-shrink-0 -mt-16 md:-mt-0">
                    <Image src={vendor.logoUrl} alt={`${vendor.name} logo`} fill className="object-contain rounded-full p-2" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold font-headline">{vendor.name}</h1>
                    <p className="text-muted-foreground">{vendor.description}</p>
                    <Badge variant="secondary" className="capitalize">{vendor.category}</Badge>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold font-headline mb-6">Menu</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {vendor.products.map(product => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            </div>
        </div>
      </main>
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
                <CardDescription className="text-sm mt-1">{product.description}</CardDescription>
            </CardContent>
            <CardFooter className="p-4 flex justify-between items-center">
                <p className="font-semibold text-lg">${product.price.toFixed(2)}</p>
                <AddToCartButton product={product} />
            </CardFooter>
        </Card>
    )
}
