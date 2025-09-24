
'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { OverviewChart } from "@/app/admin/_components/overview-chart";
import type { Order } from '@/lib/types';
import { getWeek, getMonth, getYear, format, startOfWeek, eachDayOfInterval, startOfMonth, parseISO, subMonths, subWeeks, subDays, isWithinInterval } from 'date-fns';

type Period = 'daily' | 'weekly' | 'monthly';

export function VendorSalesOverview({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = useState<Period>('monthly');

  const processData = (period: Period) => {
    const now = new Date();
    if (period === 'monthly') {
      const last3Months = Array.from({ length: 3 }, (_, i) => subMonths(now, 2 - i));
      const salesByMonth = last3Months.map(month => ({
        name: format(month, 'MMM'),
        total: 0,
      }));

      orders.forEach(order => {
        const orderDate = parseISO(order.createdAt);
        if (isWithinInterval(orderDate, { start: subMonths(now, 3), end: now })) {
          const monthIndex = last3Months.findIndex(m => getMonth(m) === getMonth(orderDate) && getYear(m) === getYear(orderDate));
          if (monthIndex !== -1) {
            salesByMonth[monthIndex].total += order.total;
          }
        }
      });
      return salesByMonth;
    }

    if (period === 'weekly') {
        const last3WeeksStarts = Array.from({ length: 3 }, (_, i) => startOfWeek(subWeeks(now, 2 - i), { weekStartsOn: 1 }));

        const salesByWeek = last3WeeksStarts.map(weekStart => ({
            name: `W${getWeek(weekStart, { weekStartsOn: 1 })}`,
            total: 0
        }));

        orders.forEach(order => {
            const orderDate = parseISO(order.createdAt);
            if(isWithinInterval(orderDate, { start: subWeeks(now, 3), end: now })) {
                const weekNumber = getWeek(orderDate, { weekStartsOn: 1 });
                const weekIndex = salesByWeek.findIndex(w => w.name === `W${weekNumber}`);
                if (weekIndex !== -1) {
                    salesByWeek[weekIndex].total += order.total;
                }
            }
        });
        return salesByWeek;
    }
    
    if (period === 'daily') {
        const last7Days = eachDayOfInterval({
            start: subDays(now, 6),
            end: now
        });

        const salesByDay = last7Days.map(day => ({
            name: format(day, 'MMM d'),
            total: 0
        }));

        orders.forEach(order => {
            const orderDate = parseISO(order.createdAt);
             if(isWithinInterval(orderDate, { start: subDays(now, 6), end: now })) {
                const dayKey = format(orderDate, 'MMM d');
                const dayIndex = salesByDay.findIndex(d => d.name === dayKey);
                if(dayIndex !== -1) {
                    salesByDay[dayIndex].total += order.total;
                }
            }
        });
        return salesByDay;
    }
    
    return [];
  };

  const currentData = processData(period);

  return (
    <Card className="lg:col-span-4">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
            <CardTitle>Sales Overview</CardTitle>
            <CardDescription>View sales performance by different periods.</CardDescription>
        </div>
        <Tabs value={period} onValueChange={(value) => setPeriod(value as Period)} className="space-y-4">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="pl-2">
        <OverviewChart data={currentData} />
      </CardContent>
    </Card>
  );
}
