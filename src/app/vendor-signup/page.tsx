
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createVendorAndUser } from '@/lib/actions';
import { Logo } from '@/components/shared/logo';
import { ArrowLeft } from 'lucide-react';

const vendorSignUpSchema = z.object({
  name: z.string().min(2, 'Your name is required.'),
  email: z.string().email('Invalid email address.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
  shopName: z.string().min(2, 'Shop name is required.'),
  shopAddress: z.string().min(10, 'Shop address is required.'),
  shopCategory: z.enum(['food', 'groceries'], { required_error: 'Please select a category.'}),
});

type VendorSignUpFormValues = z.infer<typeof vendorSignUpSchema>;

export default function VendorSignUpPage() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<VendorSignUpFormValues>({
    resolver: zodResolver(vendorSignUpSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      shopName: '',
      shopAddress: '',
      shopCategory: undefined,
    },
  });

  const onSubmit = (values: VendorSignUpFormValues) => {
    startTransition(async () => {
      const result = await createVendorAndUser(values);

      if (result.success) {
        toast({
          title: 'Registration Successful!',
          description: 'Your vendor account has been created. Please log in.',
        });
        router.push('/login');
      } else {
        toast({
          title: 'Registration Failed',
          description: result.error,
          variant: 'destructive',
        });
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-secondary">
       <div className="absolute top-6 left-6">
          <Button variant="ghost" asChild>
            <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
                <ArrowLeft className="w-4 h-4"/>
                Back to Home
            </Link>
          </Button>
      </div>
      <Card className="w-full max-w-lg mx-auto shadow-2xl shadow-primary/10 border-t-4 border-primary">
        <CardHeader className="space-y-2 text-center pt-8">
            <Logo className="justify-center"/>
            <CardTitle className="text-2xl font-headline">Become a Vendor</CardTitle>
            <CardDescription>
                Fill out the form below to create your vendor account.
            </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-sm font-medium text-muted-foreground px-1">Your Details</legend>
                 <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Full Name</FormLabel>
                        <FormControl>
                            <Input placeholder="John Doe" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                 />
                 <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="you@example.com" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" placeholder="••••••••" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                 </div>
              </fieldset>

              <fieldset className="space-y-4 border p-4 rounded-md">
                <legend className="text-sm font-medium text-muted-foreground px-1">Shop Details</legend>
                 <div className="grid md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="shopName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Shop Name</FormLabel>
                            <FormControl>
                                <Input placeholder="My Awesome Shop" {...field} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                     <FormField
                        control={form.control}
                        name="shopCategory"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isPending}>
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
                 </div>
                 <FormField
                    control={form.control}
                    name="shopAddress"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Shop Address</FormLabel>
                        <FormControl>
                            <Input placeholder="123 Main Street, Calabar" {...field} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
              </fieldset>

              <Button type="submit" className="w-full font-bold" disabled={isPending}>
                {isPending ? 'Creating Account...' : 'Sign Up as Vendor'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/login" className="underline text-primary font-medium">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
