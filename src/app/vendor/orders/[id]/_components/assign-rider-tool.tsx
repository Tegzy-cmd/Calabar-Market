
'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { handleAssignDispatcher, confirmDispatcherAssignment } from '@/lib/actions';
import type { Order, Dispatcher } from "@/lib/types";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Sparkles, Bot, CheckCircle2, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

const FormSchema = z.object({
  dispatcherIds: z.array(z.string()).refine((value) => value.some((item) => item), {
    message: "You have to select at least one dispatcher.",
  }),
});

type AssignmentResult = {
  dispatcherId: string;
  reason: string;
} | null;

export function AssignDispatcherTool({ order, allDispatchers }: { order: Order, allDispatchers: Dispatcher[] }) {
  const [isAIPending, startAITransition] = useTransition();
  const [isConfirmPending, startConfirmTransition] = useTransition();
  const [result, setResult] = useState<AssignmentResult>(null);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dispatcherIds: allDispatchers.filter(r => r.status === 'available').map(r => r.id),
    },
  });

  const onSubmit = (data: z.infer<typeof FormSchema>) => {
    startAITransition(async () => {
      setResult(null);
      setError(null);
      const res = await handleAssignDispatcher({
        orderId: order.id,
        vendorId: order.vendor.id,
        deliveryLocation: order.deliveryAddress,
        eligibleDispatcherIds: data.dispatcherIds,
      });

      if (res.error) {
        setError(res.error);
      } else if (res.data) {
        setResult(res.data);
      }
    });
  };

  const handleConfirmAssignment = () => {
      if (!result?.dispatcherId) return;
      startConfirmTransition(async () => {
        const res = await confirmDispatcherAssignment(order.id, result.dispatcherId);
        if (res.success) {
            toast({ title: 'Success!', description: 'Dispatcher has been assigned to the order.' });
            setResult(null); // Hide the AI tool result
        } else {
            toast({ title: 'Error', description: res.error, variant: 'destructive' });
        }
      });
  }
  
  const assignedDispatcher = result ? allDispatchers.find(r => r.id === result.dispatcherId) : order.dispatcher;

  if (order.dispatcher) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Dispatcher Assigned
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
             <Image src={order.dispatcher.avatarUrl} alt={order.dispatcher.name} width={50} height={50} className="rounded-full" />
            <div>
                <p className="font-bold">{order.dispatcher.name}</p>
                <p className="text-sm text-muted-foreground">{order.dispatcher.vehicle}</p>
            </div>
        </CardContent>
      </Card>
    )
  }
  
  if (order.status !== 'placed') {
      return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary" /> Manual Dispatcher Assignment
        </CardTitle>
        <CardDescription>
          Automatic assignment may have failed. Select eligible dispatchers and let AI choose the best one.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="dispatcherIds"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Available Dispatchers</FormLabel>
                  </div>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                  {allDispatchers.filter(d => d.status === 'available').map((dispatcher) => (
                    <FormField
                      key={dispatcher.id}
                      control={form.control}
                      name="dispatcherIds"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={dispatcher.id}
                            className={`flex flex-row items-center space-x-3 space-y-0 rounded-md border p-3`}
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(dispatcher.id)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, dispatcher.id])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== dispatcher.id
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <div className="flex items-center gap-3 flex-1">
                                <Image src={dispatcher.avatarUrl} alt={dispatcher.name} width={40} height={40} className="rounded-full" />
                                <div className="leading-tight">
                                    <FormLabel className="font-medium">{dispatcher.name}</FormLabel>
                                    <p className="text-sm text-muted-foreground">{dispatcher.vehicle} - {dispatcher.location}</p>
                                </div>
                            </div>
                            <Badge variant={'default'} className="capitalize bg-green-500 text-white">{dispatcher.status}</Badge>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                   {allDispatchers.filter(d => d.status === 'available').length === 0 && (
                       <Alert variant="destructive">
                           <AlertCircle className="h-4 w-4" />
                           <AlertTitle>No Dispatchers Available</AlertTitle>
                           <AlertDescription>There are currently no dispatchers available for assignment.</AlertDescription>
                       </Alert>
                   )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isAIPending || allDispatchers.filter(d => d.status === 'available').length === 0}>
              {isAIPending ? "Analyzing..." : "Find Best Dispatcher"}
            </Button>
          </form>
        </Form>
        {isAIPending && <p className="text-center mt-4 text-sm text-muted-foreground animate-pulse">AI is thinking...</p>}
        {error && <Alert variant="destructive" className="mt-4"><AlertTitle>Error</AlertTitle><AlertDescription>{error}</AlertDescription></Alert>}
        {result && assignedDispatcher && (
            <Alert className="mt-6 border-primary">
                <Bot className="h-4 w-4" />
                <AlertTitle className="font-bold text-primary">AI Recommendation</AlertTitle>
                <AlertDescription className="space-y-4 pt-2">
                    <div className="flex items-center gap-4 bg-secondary p-3 rounded-md">
                        <Image src={assignedDispatcher.avatarUrl} alt={assignedDispatcher.name} width={40} height={40} className="rounded-full" />
                        <div>
                            <p className="font-bold">{assignedDispatcher.name}</p>
                            <p className="text-sm text-muted-foreground">{assignedDispatcher.vehicle}</p>
                        </div>
                    </div>
                    <div>
                        <p className="font-semibold">Reason:</p>
                        <p>{result.reason}</p>
                    </div>

                    <Button className="w-full" onClick={handleConfirmAssignment} disabled={isConfirmPending}>
                        {isConfirmPending ? 'Assigning...' : `Confirm Assignment`}
                    </Button>
                </AlertDescription>
            </Alert>
        )}
      </CardContent>
    </Card>
  );
}
