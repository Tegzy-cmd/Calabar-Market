'use server';

/**
 * @fileOverview Automatically assigns the most suitable delivery dispatcher for each order.
 *
 * - assignBestDeliveryDispatcher - A function that handles the assignment of the best delivery dispatcher.
 * - AssignBestDeliveryDispatcherInput - The input type for the assignBestDeliveryDispatcher function.
 * - AssignBestDeliveryDispatcherOutput - The return type for the assignBestDeliveryDispatcher function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssignBestDeliveryDispatcherInputSchema = z.object({
  orderId: z.string().describe('The ID of the order to be assigned.'),
  vendorId: z.string().describe('The ID of the vendor fulfilling the order.'),
  deliveryLocation: z.string().describe('The delivery location for the order.'),
  eligibleDispatcherIds: z
    .array(z.string())
    .describe('An array of dispatcher IDs eligible for assignment.'),
});
export type AssignBestDeliveryDispatcherInput = z.infer<
  typeof AssignBestDeliveryDispatcherInputSchema
>;

const AssignBestDeliveryDispatcherOutputSchema = z.object({
  dispatcherId: z.string().describe('The ID of the assigned delivery dispatcher.'),
  reason: z.string().describe('The reason for choosing this dispatcher.'),
});
export type AssignBestDeliveryDispatcherOutput = z.infer<
  typeof AssignBestDeliveryDispatcherOutputSchema
>;

export async function assignBestDeliveryDispatcher(
  input: AssignBestDeliveryDispatcherInput
): Promise<AssignBestDeliveryDispatcherOutput> {
  return assignBestDeliveryDispatcherFlow(input);
}

const dispatcherSelectorPrompt = ai.definePrompt({
  name: 'dispatcherSelectorPrompt',
  input: {schema: AssignBestDeliveryDispatcherInputSchema},
  output: {schema: AssignBestDeliveryDispatcherOutputSchema},
  prompt: `You are an expert delivery assignment system. Given an order and a list of eligible delivery dispatchers, you must choose the best dispatcher to assign to the order.

Order ID: {{orderId}}
Vendor ID: {{vendorId}}
Delivery Location: {{deliveryLocation}}
Eligible Dispatcher IDs: {{eligibleDispatcherIds}}

Consider the following factors when choosing a dispatcher:
- Location: The dispatcher should be close to the vendor and the delivery location.
- Availability: The dispatcher should be currently available for delivery.
- Past Performance: The dispatcher should have a history of on-time and successful deliveries.

Choose the best dispatcher from the list of eligible dispatchers and provide a reason for your choice. Return the dispatcherId and reason in the JSON format.`,
});

const assignBestDeliveryDispatcherFlow = ai.defineFlow(
  {
    name: 'assignBestDeliveryDispatcherFlow',
    inputSchema: AssignBestDeliveryDispatcherInputSchema,
    outputSchema: AssignBestDeliveryDispatcherOutputSchema,
  },
  async input => {
    const {output} = await dispatcherSelectorPrompt(input);
    return output!;
  }
);
