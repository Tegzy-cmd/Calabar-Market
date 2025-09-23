'use server';

/**
 * @fileOverview Automatically assigns the most suitable delivery rider for each order.
 *
 * - assignBestDeliveryRider - A function that handles the assignment of the best delivery rider.
 * - AssignBestDeliveryRiderInput - The input type for the assignBestDeliveryRider function.
 * - AssignBestDeliveryRiderOutput - The return type for the assignBestDeliveryRider function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AssignBestDeliveryRiderInputSchema = z.object({
  orderId: z.string().describe('The ID of the order to be assigned.'),
  vendorId: z.string().describe('The ID of the vendor fulfilling the order.'),
  deliveryLocation: z.string().describe('The delivery location for the order.'),
  eligibleRiderIds: z
    .array(z.string())
    .describe('An array of rider IDs eligible for assignment.'),
});
export type AssignBestDeliveryRiderInput = z.infer<
  typeof AssignBestDeliveryRiderInputSchema
>;

const AssignBestDeliveryRiderOutputSchema = z.object({
  riderId: z.string().describe('The ID of the assigned delivery rider.'),
  reason: z.string().describe('The reason for choosing this rider.'),
});
export type AssignBestDeliveryRiderOutput = z.infer<
  typeof AssignBestDeliveryRiderOutputSchema
>;

export async function assignBestDeliveryRider(
  input: AssignBestDeliveryRiderInput
): Promise<AssignBestDeliveryRiderOutput> {
  return assignBestDeliveryRiderFlow(input);
}

const riderSelectorPrompt = ai.definePrompt({
  name: 'riderSelectorPrompt',
  input: {schema: AssignBestDeliveryRiderInputSchema},
  output: {schema: AssignBestDeliveryRiderOutputSchema},
  prompt: `You are an expert delivery assignment system. Given an order and a list of eligible delivery riders, you must choose the best rider to assign to the order.

Order ID: {{orderId}}
Vendor ID: {{vendorId}}
Delivery Location: {{deliveryLocation}}
Eligible Rider IDs: {{eligibleRiderIds}}

Consider the following factors when choosing a rider:
- Location: The rider should be close to the vendor and the delivery location.
- Availability: The rider should be currently available for delivery.
- Past Performance: The rider should have a history of on-time and successful deliveries.

Choose the best rider from the list of eligible riders and provide a reason for your choice. Return the riderId and reason in the JSON format.`,
});

const assignBestDeliveryRiderFlow = ai.defineFlow(
  {
    name: 'assignBestDeliveryRiderFlow',
    inputSchema: AssignBestDeliveryRiderInputSchema,
    outputSchema: AssignBestDeliveryRiderOutputSchema,
  },
  async input => {
    const {output} = await riderSelectorPrompt(input);
    return output!;
  }
);
