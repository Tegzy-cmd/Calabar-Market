
'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  Breadcrumb as ShadBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import React from 'react';

export function Breadcrumb() {
  const pathname = usePathname();
  const pathSegments = pathname.split('/').filter(Boolean);

  // Don't show breadcrumbs on the root of a section
  if (pathSegments.length <= 1) {
    return (
        <h1 className="text-lg font-semibold md:text-2xl capitalize">{pathSegments[0] || 'Dashboard'}</h1>
    );
  }

  return (
    <ShadBreadcrumb className="hidden md:flex">
      <BreadcrumbList>
        {pathSegments.map((segment, index) => {
          const href = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          const label = segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <React.Fragment key={href}>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="capitalize">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href} className="capitalize">{label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </ShadBreadcrumb>
  );
}
