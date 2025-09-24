
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
import { LogOut, Settings, User, LayoutDashboard, ShoppingCart, Package, Truck } from "lucide-react"
import { useAuth } from "@/hooks/use-auth";
import { auth } from "@/lib/firebase";
import { useToast } from "@/hooks/use-toast";
import Cookies from "js-cookie";


export function UserNav() {
  const { user: currentUser, appUser } = useAuth();
  const { toast } = useToast();

  const handleLogout = async () => {
    await auth.signOut();
    Cookies.remove('session_user');
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
    // Redirect to home page after logout
    window.location.href = '/';
  }

  if (!currentUser) return null;

  const userInitials = currentUser.displayName?.split(' ').map(n => n[0]).join('') || 'U';

  const getDashboardLink = () => {
    if (appUser?.role === 'admin') return "/admin";
    if (appUser?.role === 'vendor') return "/vendor";
    if (appUser?.role === 'dispatcher') return "/dispatcher";
    return "/browse"; // Fallback for regular users
  }
  
  const isVendor = appUser?.role === 'vendor';
  const isAdmin = appUser?.role === 'admin';
  const isDispatcher = appUser?.role === 'dispatcher';


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
           {!isAdmin && !isVendor && !isDispatcher && (
             <DropdownMenuItem asChild>
               <Link href="/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
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
             {isDispatcher && (
              <DropdownMenuItem asChild>
                <Link href="/dispatcher">
                  <Truck className="mr-2 h-4 w-4" />
                  <span>My Tasks</span>
                </Link>
              </DropdownMenuItem>
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
