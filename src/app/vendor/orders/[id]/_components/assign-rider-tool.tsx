'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { handleAssignRider } from '@/lib/actions';
import type { Order, Rider } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Bot, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';

const FormSchema = z.object({
  riderIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one rider.",
  }),
});

type AssignmentResult = {
  riderId: string;
  reason: string;
} | null;

export function AssignRiderTool({ order, allRiders }: { order: Order, allRiders: Rider[] }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AssignmentResult>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      riderIds: allRiders.filter(r => r.status === 'available').map(r => r.id),
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    startTransition(async () => {
      setResult(null);
      setError(null);
      const res = await handleAssignRider({
        orderId: order.id,
        vendorId: order.vendor.id,
        deliveryLocation: order.deliveryAddress,
        eligibleRiderIds: data.riderIds,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setResult(res.data);
      }
    });
  };
  
  const assignedRider = result ? allRiders.find(r => r.id === result.riderId) : order.rider;

  if (assignedRider && !result) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Rider Assigned
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
            <Image src={assignedRider.avatarUrl} alt={assignedRider.name} width={50} height={50} className="rounded-full" />
            <div>
                <p className="font-bold">{assignedRider.name}</p>
                <p className="text-sm text-muted-foreground">{assignedRider.vehicle}</p>
            </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" /> Assign Rider
        </CardTitle>
        <CardDescription>
          Select eligible riders and let AI choose the best one for this order.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="riderIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Available Riders</FormLabel>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {allRiders.map((rider) => (
                    <FormField
                      key={rider.id}
                      control={form.control}
                      name="riderIds"
                      render={({ field }) => {
                        const isDisabled = rider.status !== 'available';
                        return (
                          <FormItem
                            key={rider.id}
                            className={`flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3 ${isDisabled ? 'opacity-50 bg-muted' : ''}`}
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(rider.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, rider.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== rider.id
                                        )
                                      );
                                }}
                                disabled={isDisabled}
                              />
                            </FormControl>
                            <div className="flex items-center gap-3 flex-1">
                                <Image src={rider.avatarUrl} alt={rider.name} width={40} height={40} className="rounded-full" />
                                <div className="leading-tight">
                                    <FormLabel className="font-medium">{rider.name}</FormLabel>
                                    <p className="text-sm text-muted-foreground">{rider.vehicle} - {rider.location}</p>
                                </div>
                            </div>
                            <Badge variant={rider.status === 'available' ? 'default' : 'secondary'} className="capitalize bg-green-500 text-white">{rider.status}</Badge>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? "Analyzing..." : "Find Best Rider"}
            </Button>
          </form>
        </Form>
        {isPending && <p className="text-center mt-4 text-sm text-muted-foreground animate-pulse">AI is thinking...</p>}
        {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {result && assignedRider && (
            <Alert className="mt-6 border-primary">
                <Bot className="h-4 w-4" />
                <AlertTitle className="font-bold text-primary">AI Recommendation</AlertTitle>
                <AlertDescription className="space-y-4 pt-2">
                    <div className="flex items-center gap-4 bg-secondary p-3 rounded-md">
                        <Image src={assignedRider.avatarUrl} alt={assignedRider.name} width={40} height={40} className="rounded-full" />
                        <div>
                            <p className="font-bold">{assignedRider.name}</p>
                            <p className="text-sm text-muted-foreground">{assignedRider.vehicle}</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold">Reason:</p>
                        <p>{result.reason}</p>
                    </div>

                    <Button className="w-full" onClick={() => alert(`Assigned ${assignedRider.name}!`)}>
                        Confirm Assignment
                    </Button>
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
