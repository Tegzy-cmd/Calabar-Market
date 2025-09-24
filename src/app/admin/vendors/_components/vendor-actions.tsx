
'use client';

import { useState, useTransition } from 'react';
import { MoreHorizontal, Trash2, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Vendor } from '@/lib/types';
import { deleteVendor } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { VendorForm } from './vendor-form';
import Link from 'next/link';

export function VendorActions({ vendor }: { vendor?: Vendor }) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleDelete = () => {
    if (!vendor) return;
    startTransition(async () => {
      const result = await deleteVendor(vendor.id);
      if (result.success) {
        toast({ title: 'Success', description: 'Vendor deleted successfully.' });
        setIsConfirmOpen(false);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  if (!vendor) {
    return (
      <>
        <VendorForm isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
        <Button onClick={() => setIsFormOpen(true)}>Add Vendor</Button>
      </>
    );
  }

  return (
    <>
      <VendorForm vendor={vendor} isOpen={isFormOpen} onOpenChange={setIsFormOpen} />
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the vendor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isPending}>
              {isPending ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button aria-haspopup="true" size="icon" variant="ghost">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => setIsFormOpen(true)}>Edit</DropdownMenuItem>
           <DropdownMenuItem asChild>
              <Link href={`/admin/vendors/${vendor.id}/products`}>
                <Package className="mr-2 h-4 w-4" />
                View Products
              </Link>
            </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setIsConfirmOpen(true)} className="text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
