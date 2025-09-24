
'use client';

import { useState, useTransition } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { Order, OrderStatus } from '@/lib/types';
import { updateOrderStatus } from '@/lib/actions';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Check, MoreHorizontal, Package, Send, Truck } from 'lucide-react';
import { OrderActions } from './order-actions';

interface OrderStatusUpdaterProps {
  order: Order;
  role: 'vendor' | 'dispatcher' | 'admin';
}

export function OrderStatusUpdater({ order, role }: OrderStatusUpdaterProps) {
  const [isPending, startTransition] = useTransition();
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleUpdateStatus = (status: OrderStatus) => {
    startTransition(async () => {
      const result = await updateOrderStatus(order.id, status);
      if (result.success) {
        toast({ title: 'Success', description: `Order status updated.` });
      } else {
        toast({ title: 'Error', description: result.error, variant: 'destructive' });
      }
    });
  };

  const vendorActions = [
    { 
      label: 'Mark as Preparing', 
      icon: <Package className="mr-2 h-4 w-4" />, 
      condition: order.status === 'placed',
      action: () => setIsAssignDialogOpen(true) 
    },
  ];

  const dispatcherActions = [
    { 
      status: 'dispatched', 
      label: 'Confirm Pickup', 
      icon: <Truck className="mr-2 h-4 w-4" />, 
      condition: order.status === 'preparing' || order.status === 'placed',
      action: () => handleUpdateStatus('dispatched')
    },
    { 
      status: 'awaiting-confirmation', 
      label: 'Mark as Delivered', 
      icon: <Check className="mr-2 h-4 w-4" />, 
      condition: order.status === 'dispatched',
      action: () => handleUpdateStatus('awaiting-confirmation')
    },
  ];

  const actions = role === 'vendor' ? vendorActions : dispatcherActions;
  const availableActions = actions.filter(action => action.condition);

  if (availableActions.length === 0 && role === 'vendor' && order.status !== 'placed') {
      return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                    <Send className="mr-2 h-4 w-4" />
                    <span>Dispatcher Assigned</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }
  
  if (role === 'vendor' && order.status !== 'placed') {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" disabled>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                    <Send className="mr-2 h-4 w-4" />
                    <span>Dispatcher Assigned</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }

  if (availableActions.length === 0 && role === 'dispatcher' && (order.status === 'delivered' || order.status === 'cancelled' || order.status === 'awaiting-confirmation')) {
    return null;
  }

  if (availableActions.length === 0 && role === 'dispatcher') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" disabled>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
      </DropdownMenu>
    );
  }


  return (
    <>
      {role === 'vendor' && <OrderActions order={order} isOpen={isAssignDialogOpen} onOpenChange={setIsAssignDialogOpen} />}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="icon" variant="ghost" disabled={isPending}>
            {isPending ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div> : <MoreHorizontal className="h-4 w-4" />}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {availableActions.map(action => (
            <DropdownMenuItem key={action.label} onClick={action.action} disabled={isPending}>
              {action.icon}
              <span>{action.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

    