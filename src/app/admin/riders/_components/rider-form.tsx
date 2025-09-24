
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
import { useToast } from '@/hooks/use-toast';
import type { Rider, RiderStatus } from '@/lib/types';
import { createRider, updateRider } from '@/lib/actions';
import { placeholderImages } from '@/lib/placeholder-images';

const riderFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  vehicle: z.string().min(2, 'Vehicle type must be specified.'),
  location: z.string().min(2, 'Location is required.'),
  status: z.enum(['available', 'unavailable', 'on-delivery']),
  completedRides: z.coerce.number().min(0, 'Completed rides must be a positive number.'),
  rating: z.coerce.number().min(0).max(5, 'Rating must be between 0 and 5.'),
});

type RiderFormValues = z.infer<typeof riderFormSchema>;

interface RiderFormProps {
  rider?: Rider;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function RiderForm({ rider, isOpen, onOpenChange }: RiderFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<RiderFormValues>({
    resolver: zodResolver(riderFormSchema),
    defaultValues: rider ? { 
        name: rider.name,
        vehicle: rider.vehicle,
        location: rider.location,
        status: rider.status,
        completedRides: rider.completedRides,
        rating: rider.rating,
    } : {
        name: '',
        vehicle: 'Motorcycle',
        location: '',
        status: 'available',
        completedRides: 0,
        rating: 5,
    },
  });

  const onSubmit = (values: RiderFormValues) => {
    startTransition(async () => {
      const riderData: Omit<Rider, 'id'> = {
        ...values,
        avatarUrl: rider?.avatarUrl || placeholderImages.find(p => p.id === 'rider-avatar-1')?.imageUrl || '',
      };

      const result = rider
        ? await updateRider(rider.id, riderData)
        : await createRider(riderData);

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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{rider ? 'Edit Rider' : 'Add New Rider'}</DialogTitle>
          <DialogDescription>
            {rider ? "Update the rider's details below." : "Enter the details for the new rider."}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Mike Ross" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="vehicle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle</FormLabel>
                  <FormControl>
                    <Input placeholder="Motorcycle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Downtown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <div className="grid grid-cols-2 gap-4">
                <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Rating</FormLabel>
                    <FormControl>
                        <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="completedRides"
                render={({ field }) => (
                    <FormItem>
                    <FormLabel>Completed Rides</FormLabel>
                    <FormControl>
                        <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                    </FormItem>
                )}
                />
            </div>
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="on-delivery">On Delivery</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : 'Save Rider'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
