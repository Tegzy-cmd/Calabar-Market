
'use client';

import { UserNav } from "@/components/shared/user-nav";
import { Breadcrumb } from '@/components/shared/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';

export function VendorHeader() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
       <div className="flex items-center gap-2 md:hidden">
          <SidebarTrigger />
       </div>
       <Breadcrumb />
      <div className="relative ml-auto flex-1 md:grow-0">
        {/* Search can go here if needed */}
      </div>
      <UserNav />
    </header>
  );
}
