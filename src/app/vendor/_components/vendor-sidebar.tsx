
'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/shared/logo';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Package, Settings, ShoppingCart } from 'lucide-react';
import { UserNav } from '@/components/shared/user-nav';

const menuItems = [
  { href: '/vendor', label: 'Dashboard', icon: Home },
  { href: '/vendor/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/vendor/products', label: 'Products', icon: Package },
];

const settingsItem = {
  href: '/vendor/settings',
  label: 'Settings',
  icon: Settings,
};

export function VendorSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || (href !== '/vendor' && pathname.startsWith(href));
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  as="a"
                  isActive={isActive(item.href)}
                  tooltip={{ children: item.label }}
                >
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href={settingsItem.href} passHref legacyBehavior>
              <SidebarMenuButton
                as="a"
                isActive={isActive(settingsItem.href)}
                tooltip={{ children: settingsItem.label }}
              >
                <settingsItem.icon />
                <span>{settingsItem.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
