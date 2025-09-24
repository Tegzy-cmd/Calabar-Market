
'use client';

import { useState } from "react";
import type { Vendor, Product } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { VendorActions } from "./vendor-actions";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";

export function VendorTable({ vendors }: { vendors: Vendor[] }) {
  const [openVendorId, setOpenVendorId] = useState<string | null>(null);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[50px]"></TableHead>
          <TableHead>Vendor</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Products</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {vendors.map((vendor) => (
          <Collapsible asChild key={vendor.id} open={openVendorId === vendor.id} onOpenChange={() => setOpenVendorId(prevId => prevId === vendor.id ? null : vendor.id)}>
            <>
              <TableRow>
                <TableCell>
                  <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="icon" className="w-9">
                          {openVendorId === vendor.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          <span className="sr-only">Toggle products for {vendor.name}</span>
                      </Button>
                  </CollapsibleTrigger>
                </TableCell>
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
                <TableCell>{vendor.products.length}</TableCell>
                <TableCell className="text-right">
                    <VendorActions vendor={vendor} />
                </TableCell>
              </TableRow>
              <CollapsibleContent asChild>
                <TableRow>
                    <TableCell colSpan={5} className="p-0">
                        <div className="bg-muted/50 p-4">
                            <h4 className="font-bold mb-2">Products from {vendor.name}</h4>
                            {vendor.products.length > 0 ? (
                                <ProductTable products={vendor.products} />
                            ) : (
                                <p className="text-sm text-muted-foreground">No products found for this vendor.</p>
                            )}
                        </div>
                    </TableCell>
                </TableRow>
              </CollapsibleContent>
            </>
          </Collapsible>
        ))}
      </TableBody>
    </Table>
  );
}


function ProductTable({ products }: { products: Product[] }) {
    return (
        <div className="border rounded-md">
            <Table>
                <TableHeader>
                    <TableRow className="bg-background hover:bg-background">
                        <TableHead>Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Stock</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {products.map(product => (
                        <TableRow key={product.id} className="bg-background hover:bg-muted/50">
                            <TableCell>
                                <Image src={product.imageUrl} alt={product.name} width={40} height={40} className="rounded-md object-cover" />
                            </TableCell>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>₦{product.price.toFixed(2)}</TableCell>
                            <TableCell>{product.stock}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
