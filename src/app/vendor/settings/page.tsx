
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
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
import { updateVendor } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { getVendorById } from '@/lib/data';
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

export default function VendorSettingsPage() {
  const { appUser, loading: authLoading } = useAuth();
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

   useEffect(() => {
    if (authLoading) return;
    if (!appUser || appUser.role !== 'vendor') {
      router.push('/login?redirect=/vendor/settings');
      return;
    }
    
    const fetchVendor = async () => {
        const vendorId = appUser.vendorId;

        if (!vendorId) {
            toast({ title: 'Error', description: 'Could not find your vendor profile.', variant: 'destructive'});
            setLoading(false);
            return;
        }

        const vendorData = await getVendorById(vendorId);
        if (vendorData) {
            setVendor(vendorData);
            form.reset(vendorData);
        }
        setLoading(false);
    }

    fetchVendor();
  }, [appUser, authLoading, router]);

  const form = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
        name: '',
        description: '',
        address: '',
        category: 'food',
        logoUrl: '',
        bannerUrl: '',
    },
  });

  const onSubmit = (values: VendorFormValues) => {
    if (!vendor) return;
    startTransition(async () => {
      const result = await updateVendor(vendor.id, values);
      if (result.success) {
        toast({ title: 'Success', description: 'Your profile has been updated.' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  if (loading || authLoading) {
      return <div>Loading...</div>
  }

  if (!vendor) {
      return <div>Could not load vendor data. Please ensure your user account is correctly linked to a vendor profile.</div>
  }

  return (
     <div className="space-y-8">
      <h1 className="text-3xl font-headline font-bold">Store Settings</h1>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Store Details</CardTitle>
                <CardDescription>
                  Update your shop's public information here.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
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
              </CardContent>
            </Card>

            <Card>
                  <CardHeader>
                      <CardTitle>Store Images</CardTitle>
                      <CardDescription>
                          Update your store's logo and banner.
                      </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
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
                  </CardContent>
              </Card>

            <div className="flex items-center justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => form.reset(vendor)}>Discard</Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
        </form>
      </Form>
    </div>
  );
}
