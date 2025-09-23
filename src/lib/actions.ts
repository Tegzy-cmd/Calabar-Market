'use server';

import {
  assignBestDeliveryRider,
  type AssignBestDeliveryRiderInput,
} from '@/ai/flows/assign-best-delivery-rider';

export async function handleAssignRider(input: AssignBestDeliveryRiderInput) {
  try {
    const result = await assignBestDeliveryRider(input);
    // In a real app, you would update your database with the assignment here.
    // For example: await db.updateOrder(input.orderId, { riderId: result.riderId });
    return { data: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unexpected error occurred." };
  }
}
