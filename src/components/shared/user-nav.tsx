
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { CreditCard, LogOut, Settings, User, LayoutDashboard, ShoppingCart, Package } from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import { usePathname } from "next/navigation";

export function UserNav() {
  const { user: currentUser } = useAuth();
  const { toast } = useToast();
  const pathname = usePathname();

  const handleLogout = async () => {
    await auth.signOut();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  }

  if (!currentUser) return null;

  const userInitials = currentUser.displayName?.split(' ').map(n => n[0]).join('') || 'U';

  const isAdmin = pathname.startsWith('/admin');
  const isVendor = pathname.startsWith('/vendor');

  const getDashboardLink = () => {
    if (isAdmin) return "/admin";
    if (isVendor) return "/vendor";
    return "/browse";
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={currentUser.photoURL || ''} alt={`@${currentUser.displayName}`} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
           <DropdownMenuItem asChild>
            <Link href={getDashboardLink()}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/profile">
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
           {!isAdmin && !isVendor && (
             <DropdownMenuItem asChild>
               <Link href="/orders">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>My Orders</span>
               </Link>
            </DropdownMenuItem>
           )}
            {isVendor && (
              <>
                 <DropdownMenuItem asChild>
                  <Link href="/vendor/orders">
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      <span>Orders</span>
                  </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                  <Link href="/vendor/products">
                      <Package className="mr-2 h-4 w-4" />
                      <span>Products</span>
                  </Link>
                  </DropdownMenuItem>
              </>
            )}
          <DropdownMenuItem asChild>
             <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
             </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
