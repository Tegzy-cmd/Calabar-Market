
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
import { useToast } from '@/hooks/use-toast';
import type { Dispatcher } from '@/lib/types';
import { createDispatcher, updateDispatcher } from '@/lib/actions';
import { getPlaceholderImage } from '@/lib/placeholder-images';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const dispatcherFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  phoneNumber: z.string().min(10, 'A valid phone number is required.'),
  vehicle: z.enum(['bicycle', 'scooter', 'motorbike', 'car', 'van']),
  location: z.string().min(2, 'Location is required.'),
  status: z.enum(['available', 'on-delivery', 'unavailable']),
});

type DispatcherFormValues = z.infer<typeof dispatcherFormSchema>;

interface DispatcherFormProps {
  dispatcher?: Dispatcher;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const statusOptions = [
  { value: "available", label: "Available" },
  { value: "on-delivery", label: "On Delivery" },
  { value: "unavailable", label: "Unavailable" },
] as const;

const vehicleOptions = [
    { value: 'bicycle', label: 'Bicycle' },
    { value: 'scooter', label: 'Scooter' },
    { value: 'motorbike', label: 'Motorbike' },
    { value: 'car', label: 'Car' },
    { value: 'van', label: 'Van' },
] as const;

export function DispatcherForm({ dispatcher, isOpen, onOpenChange }: DispatcherFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<DispatcherFormValues>({
    resolver: zodResolver(dispatcherFormSchema),
    defaultValues: dispatcher ? {
        name: dispatcher.name,
        phoneNumber: dispatcher.phoneNumber,
        vehicle: dispatcher.vehicle,
        location: dispatcher.location,
        status: dispatcher.status,
    } : {
        name: '',
        phoneNumber: '',
        vehicle: 'motorbike',
        location: '',
        status: 'available',
    },
  });

  const onSubmit = (values: DispatcherFormValues) => {
    startTransition(async () => {
        const dispatcherData = {
            ...values,
            avatarUrl: dispatcher?.avatarUrl || getPlaceholderImage('rider-avatar-1'),
            rating: dispatcher?.rating || 5,
            completedDispatches: dispatcher?.completedDispatches || 0
        };

      const result = dispatcher
        ? await updateDispatcher(dispatcher.id, dispatcherData)
        : await createDispatcher(dispatcherData as Omit<Dispatcher, 'id'>);

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
          <DialogTitle>{dispatcher ? 'Edit Dispatcher' : 'Add New Dispatcher'}</DialogTitle>
          <DialogDescription>
            {dispatcher ? "Update the dispatcher's details below." : "Enter the details for the new dispatcher."}
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
                    <Input placeholder="John Doe" {...field} />
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
              name="vehicle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Vehicle Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Location</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Downtown" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                      {statusOptions.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
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
                {isPending ? 'Saving...' : 'Save Dispatcher'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
