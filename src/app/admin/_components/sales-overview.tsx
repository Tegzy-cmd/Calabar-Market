
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
import { OverviewChart } from "./overview-chart";
import type { Order } from '@/lib/types';
import { getWeek, getMonth, getYear, format, startOfWeek, endOfWeek, eachDayOfInterval, startOfMonth, endOfMonth, eachWeekOfInterval, parseISO } from 'date-fns';

type Period = 'daily' | 'weekly' | 'monthly';

export function SalesOverview({ orders }: { orders: Order[] }) {
  const [period, setPeriod] = useState<Period>('monthly');

  const processData = (period: Period) => {
    if (period === 'monthly') {
      const salesByMonth = Array.from({ length: 12 }, (_, i) => ({
        name: format(new Date(0, i), 'MMM'),
        total: 0,
      }));

      orders.forEach(order => {
        const month = getMonth(parseISO(order.createdAt));
        salesByMonth[month].total += order.total;
      });
      return salesByMonth;
    }

    if (period === 'weekly') {
      const salesByWeek: { [key: string]: { name: string, total: number } } = {};
      const year = getYear(new Date());

      const weeksInYear = eachWeekOfInterval({
        start: startOfYear(new Date(year, 0, 1)),
        end: endOfYear(new Date(year, 11, 31)),
      });

      weeksInYear.forEach((weekStart, i) => {
        const weekNumber = i + 1;
        salesByWeek[weekNumber] = { name: `W${weekNumber}`, total: 0 };
      });
      
      orders.forEach(order => {
        const date = parseISO(order.createdAt);
        if (getYear(date) === year) {
            const weekNumber = getWeek(date, { weekStartsOn: 1 });
             if (salesByWeek[weekNumber]) {
                salesByWeek[weekNumber].total += order.total;
            }
        }
      });
      
      return Object.values(salesByWeek);
    }
    
    if (period === 'daily') {
        const salesByDay: { [key: string]: { name: string, total: number } } = {};
        const last30Days = eachDayOfInterval({
            start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            end: new Date()
        });

        last30Days.forEach(day => {
            const dayKey = format(day, 'MMM d');
            salesByDay[dayKey] = { name: dayKey, total: 0 };
        })

        orders.forEach(order => {
            const dayKey = format(parseISO(order.createdAt), 'MMM d');
            if(salesByDay[dayKey]) {
                salesByDay[dayKey].total += order.total;
            }
        });
        return Object.values(salesByDay);
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

// Helper functions to get start and end of year
function startOfYear(date: Date) {
  return new Date(date.getFullYear(), 0, 1);
}
function endOfYear(date: Date) {
  return new Date(date.getFullYear(), 11, 31);
}
