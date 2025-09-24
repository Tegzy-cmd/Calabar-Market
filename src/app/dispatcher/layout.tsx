
import React from 'react';
import { DispatcherHeader } from './_components/dispatcher-header';

export default function DispatcherLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <DispatcherHeader />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  )
}
