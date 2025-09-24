
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
import type { Dispatcher, DispatcherVehicle } from '@/lib/types';
import { createDispatcher, updateDispatcher } from '@/lib/actions';
import { placeholderImages } from '@/lib/placeholder-images';

const vehicleTypes: DispatcherVehicle[] = ['bicycle', 'scooter', 'motorbike', 'car', 'van'];

const dispatcherFormSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  vehicle: z.enum(vehicleTypes),
  location: z.string().min(2, 'Location is required.'),
  status: z.enum(['available', 'unavailable', 'on-delivery']),
});

type DispatcherFormValues = z.infer<typeof dispatcherFormSchema>;

interface DispatcherFormProps {
  dispatcher?: Dispatcher;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function DispatcherForm({ dispatcher, isOpen, onOpenChange }: DispatcherFormProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const form = useForm<DispatcherFormValues>({
    resolver: zodResolver(dispatcherFormSchema),
    defaultValues: dispatcher
    ? {
        name: dispatcher.name,
        vehicle: dispatcher.vehicle,
        location: dispatcher.location,
        status: dispatcher.status,
      }
    : {
        name: '',
        vehicle: 'motorbike' as DispatcherVehicle,
        location: '',
        status: 'available' as const,
      },
  });

  const onSubmit = (values: DispatcherFormValues) => {
    startTransition(async () => {
      const result = dispatcher
        ? await updateDispatcher(dispatcher.id, values)
        : await createDispatcher({
            ...values,
            avatarUrl: placeholderImages.find(p => p.id === 'rider-avatar-1')?.imageUrl || '',
            completedDispatches: 0,
            rating: 5,
        });

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
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a vehicle type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {vehicleTypes.map(type => (
                        <SelectItem key={type} value={type} className="capitalize">{type}</SelectItem>
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
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Downtown" {...field} />
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
                      </Trigger>
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
                {isPending ? 'Saving...' : 'Save Dispatcher'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
