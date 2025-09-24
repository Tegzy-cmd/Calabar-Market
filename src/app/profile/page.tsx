
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { updateUser } from '@/lib/actions';
import { useAuth } from '@/hooks/use-auth';
import { AppHeader } from '@/components/shared/header';
import { Textarea } from '@/components/ui/textarea';

const profileFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email(),
  phoneNumber: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { appUser, loading: authLoading, syncUser } = useAuth();
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !appUser) {
      router.push('/login?redirect=/profile');
    }
  }, [appUser, authLoading, router]);

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phoneNumber: '',
      address: '',
    },
  });
  
  useEffect(() => {
      if (appUser) {
          form.reset({
            name: appUser.name,
            email: appUser.email,
            phoneNumber: appUser.phoneNumber || '',
            address: appUser.addresses?.[0] || '',
          })
      }
  }, [appUser, form])

  const onSubmit = (values: ProfileFormValues) => {
    if (!appUser) return;
    startTransition(async () => {
        const userData = {
            ...values,
            addresses: values.address ? [values.address] : appUser.addresses,
        }
      const result = await updateUser(appUser.id, userData);
      if (result.success) {
        toast({ title: 'Success', description: 'Your profile has been updated.' });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  if (authLoading || !appUser) {
    return (
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
          <p>Loading...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <AppHeader />
      <main className="flex-1 container mx-auto px-4 md:px-6 py-8">
        <div className="space-y-8 max-w-2xl mx-auto">
            <h1 className="text-3xl font-headline font-bold">My Profile</h1>
            
            <Card>
                <CardHeader>
                    <CardTitle>Personal Information</CardTitle>
                    <CardDescription>Update your personal details here.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="John Doe" {...field} />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                    <Input type="email" {...field} disabled />
                                </FormControl>
                                <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="phoneNumber"
                            render={({ field }) => (
                                <FormItem>
                                <FormLabel>Phone Number</FormLabel>
                                <FormControl>
                                    <Input placeholder="+234 801 234 5678" {...field} />
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
                                <FormLabel>Primary Address</FormLabel>
                                <FormControl>
                                    <Textarea placeholder="123 Main Street, Calabar" {...field} />
                                </FormControl>
                                 <FormDescription>
                                    You can add more addresses in a future update.
                                 </FormDescription>
                                <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end">
                            <Button type="submit" disabled={isPending}>
                                {isPending ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
      </main>
    </div>
  );
}
