'use client';

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { useToast } from "@/hooks/use-toast";
import type { Product } from "@/lib/types";
import { PlusCircle } from "lucide-react";

export function AddToCartButton({ product }: { product: Product }) {
    const { addToCart } = useCart();
    const { toast } = useToast();

    const handleAddToCart = () => {
        addToCart(product);
        toast({
            title: "Added to cart!",
            description: `${product.name} has been added to your cart.`,
        })
    }
    
    return (
        <Button size="sm" onClick={handleAddToCart}>
            <PlusCircle className="h-4 w-4 mr-2" />
            Add
        </Button>
    )
}
