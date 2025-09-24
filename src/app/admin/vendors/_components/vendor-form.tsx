
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import type { Vendor } from '@/lib/types';
import { createVendor, updateVendor } from '@/lib/actions';
import { placeholderImages } from '@/lib/placeholder-images';
import { ImageUploader } from '@/components/shared/image-uploader';

const vendorFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  description: z.string().min(10, 'Description must be at least 10 characters.'),
  address: z.string().min(10, 'Address must be at least 10 characters.'),
  category: z.enum(['food', 'groceries']),
  logoUrl: z.string().url('Must be a valid URL or Data URL.'),
  bannerUrl: z.string().url('Must be a valid URL or Data URL.'),
});

type VendorFormValues = z.infer<typeof vendorFormSchema>;

interface VendorFormProps {
  vendor?: Vendor;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function VendorForm({ vendor, isOpen, onOpenChange }: VendorFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: vendor ? { 
        name: vendor.name, 
        description: vendor.description,
        address: vendor.address,
        category: vendor.category,
        logoUrl: vendor.logoUrl,
        bannerUrl: vendor.bannerUrl,
    } : {
        name: '',
        description: '',
        address: '',
        category: 'food',
        logoUrl: placeholderImages.find(p => p.id === 'vendor-logo-1')?.imageUrl,
        bannerUrl: placeholderImages.find(p => p.id === 'vendor-banner-1')?.imageUrl,
    },
  });

  const onSubmit = (values: VendorFormValues) => {
    startTransition(async () => {
      const result = vendor
        ? await updateVendor(vendor.id, values)
        : await createVendor(values);

      if (result.success) {
        toast({ title: 'Success', description: result.message });
        onOpenChange(false);
        form.reset();
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{vendor ? 'Edit Vendor' : 'Add New Vendor'}</DialogTitle>
          <DialogDescription>
            {vendor ? "Update the vendor's details below." : "Enter the details for the new vendor."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[80vh] overflow-y-auto pr-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vendor Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Burger Queen" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="The best burgers in town." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Food Street, Calabar" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="food">Food</SelectItem>
                      <SelectItem value="groceries">Groceries</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <ImageUploader label="Logo" value={field.value || ''} onValueChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="bannerUrl"
              render={({ field }) => (
                <FormItem>
                  <ImageUploader label="Banner" value={field.value || ''} onValueChange={field.onChange} />
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="sticky bottom-0 bg-background pt-4 pb-0 -mb-4">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Vendor'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
