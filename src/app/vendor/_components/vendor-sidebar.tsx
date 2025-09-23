
'use client';

import {
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/logo';
import {
  Package,
  ShoppingCart,
  BarChart2,
  Settings
} from 'lucide-react';
import { UserNav } from '@/components/shared/user-nav';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const menuItems = [
  { href: '/vendor', icon: BarChart2, label: 'Dashboard' },
  { href: '/vendor/orders', icon: ShoppingCart, label: 'Orders' },
  { href: '/vendor/products', icon: Package, label: 'Products' },
];

export function VendorSidebar() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <div className="flex items-center justify-between">
          <Logo href="/vendor" />
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton
                  isActive={pathname.startsWith(item.href) && (item.href !== '/vendor' || pathname === '/vendor')}
                  icon={<item.icon />}
                  tooltip={item.label}
                >
                  {item.label}
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            <SidebarMenuItem>
                 <SidebarMenuButton icon={<Settings />} tooltip="Settings">
                    Settings
                </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
                <UserNav />
            </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
