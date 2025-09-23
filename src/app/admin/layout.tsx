import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen">
      <div className="p-4 sm:p-6 lg:p-8">
        {children}
      </div>
    </div>
  )
}
