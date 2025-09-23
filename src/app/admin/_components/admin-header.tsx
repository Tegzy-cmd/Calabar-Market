
'use client';

import Link from "next/link";
import { UserNav } from "@/components/shared/user-nav";
import { Logo } from "@/components/shared/logo";
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";

const menuItems = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/users', label: 'Users' },
  { href: '/admin/vendors', label: 'Vendors' },
  { href: '/admin/riders', label: 'Riders' },
  { href: '/admin/seed', label: 'Seed Data' },
];

export function AdminHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Logo href="/admin" />
        <nav className="hidden md:flex flex-1 items-center justify-center space-x-5 text-sm font-medium">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center justify-end space-x-4">
            <UserNav />
        </div>
      </div>
    </header>
  );
}
