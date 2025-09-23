
'use client';

import Link from "next/link";
import { ShoppingCart, LogIn, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserNav } from "@/components/shared/user-nav";
import { Logo } from "@/components/shared/logo";
import { useCart } from "@/hooks/use-cart";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "../ui/skeleton";

export function AppHeader() {
  const { user: isAuthenticated, loading } = useAuth();
  const { items } = useCart();
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo />
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-10">
          <Link
            href="/browse"
            className="transition-colors hover:text-primary"
          >
            Browse
          </Link>
          <Link
            href="/orders"
            className="transition-colors hover:text-primary"
          >
            My Orders
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end space-x-4">
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link href="/cart">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && <Badge className="absolute -right-2 -top-2 h-5 w-5 justify-center p-0">{totalItems}</Badge>}
              <span className="sr-only">Shopping Cart</span>
            </Link>
          </Button>
          {loading ? (
            <div className="flex items-center space-x-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="hidden sm:flex flex-col space-y-1">
                 <Skeleton className="h-4 w-20" />
              </div>
            </div>
          ) : isAuthenticated ? (
            <UserNav />
          ) : (
            <div className="hidden sm:flex items-center space-x-2">
              <Button variant="ghost" asChild>
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Link>
              </Button>
              <Button asChild>
                <Link href="/signup">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Sign Up
                </Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
