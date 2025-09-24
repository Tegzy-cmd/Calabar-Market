
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { OrderStatus } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getOrderStatusVariant(status: OrderStatus): "default" | "secondary" | "destructive" | "outline" {
    switch (status) {
      case 'delivered':
        return 'default';
      case 'cancelled':
        return 'destructive';
      case 'dispatched':
          return 'secondary';
      case 'preparing':
          return 'outline';
      case 'awaiting-confirmation':
          return 'outline';
      case 'placed':
          return 'secondary';
      default:
        return 'secondary';
    }
};

    