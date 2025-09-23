import { Suspense } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getVendors } from '@/lib/data';
import type { Vendor } from '@/lib/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AppHeader } from '@/components/shared/header';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

type SearchParams = {
  searchParams?: {
    category?: 'food' | 'groceries';
    q?: string;
  };
};

export default function BrowsePage({ searchParams }: SearchParams) {
  const category = searchParams?.category;

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="space-y-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-headline font-bold capitalize">
                {category || 'All Vendors'}
            </h1>
            <p className="text-lg text-muted-foreground">
                Browse through our curated list of vendors.
            </p>
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Search vendors..." className="pl-10" />
            </div>
        </div>
        <Suspense fallback={<VendorGridSkeleton />}>
          <VendorGrid category={category} />
        </Suspense>
      </main>
    </div>
  );
}

async function VendorGrid({ category }: { category?: 'food' | 'groceries' }) {
  const vendors = await getVendors(category);
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {vendors.map((vendor) => (
        <VendorCard key={vendor.id} vendor={vendor} />
      ))}
    </div>
  );
}

function VendorCard({ vendor }: { vendor: Vendor }) {
  return (
    <Link href={`/browse/vendors/${vendor.id}`} className="group">
      <Card className="h-full overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-2xl group-hover:scale-105 group-hover:shadow-primary/10">
        <CardHeader className="p-0">
          <div className="relative h-40">
            <Image
              src={vendor.bannerUrl}
              alt={`Banner for ${vendor.name}`}
              fill
              className="object-cover"
            />
            <div className="absolute bottom-[-25px] left-4">
              <AvatarIcon src={vendor.logoUrl} alt={`Logo for ${vendor.name}`} />
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-10">
          <CardTitle className="truncate font-headline">{vendor.name}</CardTitle>
          <CardDescription className="truncate">{vendor.description}</CardDescription>
        </CardContent>
        <CardFooter>
          <Badge variant="outline" className="capitalize">{vendor.category}</Badge>
        </CardFooter>
      </Card>
    </Link>
  );
}

function AvatarIcon({ src, alt }: { src: string; alt: string }) {
    return (
        <div className="relative h-16 w-16 rounded-full border-4 border-background bg-background shadow-md">
            <Image src={src} alt={alt} fill className="object-contain rounded-full p-1" />
        </div>
    )
}

function VendorGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card key={i} className="animate-pulse">
          <CardHeader className="p-0">
            <div className="bg-muted h-40" />
          </CardHeader>
          <CardContent className="pt-10">
            <div className="h-6 w-3/4 bg-muted rounded-md" />
            <div className="h-4 w-full mt-2 bg-muted rounded-md" />
          </CardContent>
          <CardFooter>
            <div className="h-6 w-20 bg-muted rounded-full" />
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
