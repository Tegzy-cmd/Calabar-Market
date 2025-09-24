
'use client';

import { useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStatus } from '@/lib/types';
import { updateOrderStatus } from '@/lib/actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, MoreHorizontal, Package, Send, Truck } from 'lucide-react';
import Link from 'next/link';

interface OrderStatusUpdaterProps {
  order: Order;
  role: 'vendor' | 'dispatcher' | 'admin';
}

export function OrderStatusUpdater({ order, role }: OrderStatusUpdaterProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const handleUpdateStatus = (status: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      if (result.success) {
        toast({ title: 'Success', description: `Order status updated to ${status}.` });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const vendorActions: { status: OrderStatus; label: string; icon: React.ReactNode; condition: boolean }[] = [
    { status: 'preparing', label: 'Mark as Preparing', icon: <Package className="mr-2 h-4 w-4" />, condition: order.status === 'placed' },
    { status: 'dispatched', label: 'Mark as Dispatched', icon: <Send className="mr-2 h-4 w-4" />, condition: order.status === 'preparing' && !!order.dispatcher },
  ];

  const dispatcherActions: { status: OrderStatus; label: string; icon: React.ReactNode; condition: boolean }[] = [
     { status: 'dispatched', label: 'Confirm Pickup', icon: <Truck className="mr-2 h-4 w-4" />, condition: order.status === 'preparing' || order.status === 'placed'},
    { status: 'delivered', label: 'Mark as Delivered', icon: <Check className="mr-2 h-4 w-4" />, condition: order.status === 'dispatched' },
  ];

  const actions = role === 'vendor' ? vendorActions : dispatcherActions;
  const availableActions = actions.filter(action => action.condition);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="icon" variant="ghost" disabled={isPending}>
          {isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : <MoreHorizontal className="h-4 w-4" />}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {role === 'vendor' && (
            <DropdownMenuItem asChild>
                <Link href={`/vendor/orders/${order.id}`}>View Details</Link>
            </DropdownMenuItem>
        )}
        {availableActions.map(action => (
          <DropdownMenuItem key={action.status} onClick={() => handleUpdateStatus(action.status)} disabled={isPending}>
            {action.icon}
            <span>{action.label}</span>
          </DropdownMenuItem>
        ))}
         {role === 'vendor' && order.status === 'preparing' && !order.dispatcher && (
            <DropdownMenuItem disabled>
                <Send className="mr-2 h-4 w-4" />
                <span>Dispatcher being assigned...</span>
            </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
