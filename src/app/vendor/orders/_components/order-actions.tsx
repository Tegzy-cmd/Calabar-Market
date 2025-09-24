
'use client';

import { useState, useTransition, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Dispatcher, Order } from '@/lib/types';
import { updateOrderStatus } from '@/lib/actions';
import { getDispatchers } from '@/lib/data';
import { Label } from '@/components/ui/label';
import { Loader, User } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface OrderActionsProps {
  order: Order;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function OrderActions({ order, isOpen, onOpenChange }: OrderActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [dispatchers, setDispatchers] = useState<Dispatcher[]>([]);
  const [selectedDispatcher, setSelectedDispatcher] = useState<string>('');
  const [isLoadingDispatchers, setIsLoadingDispatchers] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      const fetchDispatchers = async () => {
        setIsLoadingDispatchers(true);
        const allDispatchers = await getDispatchers();
        setDispatchers(allDispatchers.filter(d => d.status === 'available'));
        setIsLoadingDispatchers(false);
      };
      fetchDispatchers();
    }
  }, [isOpen]);

  const handleAssignDispatcher = () => {
    if (!selectedDispatcher) {
      toast({ title: 'Error', description: 'Please select a dispatcher.', variant: 'destructive' });
      return;
    }
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, 'preparing', selectedDispatcher);
      if (result.success) {
        toast({ title: 'Success', description: 'Dispatcher assigned and order marked as preparing.' });
        onOpenChange(false);
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Assign a Dispatcher</DialogTitle>
          <DialogDescription>
            Select an available dispatcher to assign to order #{order.id.substring(0, 7)}. This will also mark the order as 'preparing'.
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
            {isLoadingDispatchers ? (
                <div className="flex items-center justify-center h-24">
                    <Loader className="h-6 w-6 animate-spin" />
                </div>
            ) : dispatchers.length > 0 ? (
                <div className="grid gap-2">
                    <Label htmlFor="dispatcher-select">Available Dispatchers</Label>
                    <Select value={selectedDispatcher} onValueChange={setSelectedDispatcher}>
                        <SelectTrigger id="dispatcher-select">
                            <SelectValue placeholder="Select a dispatcher..." />
                        </SelectTrigger>
                        <SelectContent>
                            {dispatchers.map(d => (
                                <SelectItem key={d.id} value={d.id}>
                                   <div className="flex items-center gap-2">
                                     <Avatar className="h-6 w-6">
                                        <AvatarImage src={d.avatarUrl} alt={d.name} />
                                        <AvatarFallback>{d.name[0]}</AvatarFallback>
                                     </Avatar>
                                     <span>{d.name} ({d.vehicle})</span>
                                   </div>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            ) : (
                <div className="text-center text-sm text-muted-foreground py-8">
                    <User className="mx-auto h-8 w-8 mb-2" />
                    No dispatchers are currently available.
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleAssignDispatcher} disabled={isPending || isLoadingDispatchers || dispatchers.length === 0}>
            {isPending ? 'Assigning...' : 'Assign & Prepare'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
