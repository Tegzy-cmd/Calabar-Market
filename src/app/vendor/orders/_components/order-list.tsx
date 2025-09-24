
'use client';

import type { Order, OrderStatus } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { cn, getOrderStatusVariant } from "@/lib/utils";
import { OrderStatusUpdater } from "./order-status-updater";

export function OrderList({ orders }: { orders: Order[] }) {
    return (
        <Table>
            <TableHeader>
                <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order: Order) => (
                    <TableRow key={order.id}>
                        <TableCell className="font-medium">
                           #{order.id.substring(0, 7)}
                        </TableCell>
                        <TableCell>{order.user.name}</TableCell>
                        <TableCell>{new Date(order.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>₦{order.total.toFixed(2)}</TableCell>
                        <TableCell>
                            <Badge variant={getOrderStatusVariant(order.status)} className={cn("capitalize")}>
                                {order.status.replace('-', ' ')}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                             <Button asChild variant="outline" size="sm">
                                <Link href={`/vendor/orders/${order.id}`}>View Details</Link>
                            </Button>
                            <OrderStatusUpdater order={order} role="vendor" />
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    )
}

    