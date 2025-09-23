

'use server';

import {
  assignBestDeliveryRider,
  type AssignBestDeliveryRiderInput,
} from '@/ai/flows/assign-best-delivery-rider';
import { db } from './firebase';
import { collection, writeBatch, doc, addDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { users, vendors, products, riders, orders } from './data';
import type { User, Vendor } from './types';
import { revalidatePath } from 'next/cache';


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

export async function seedDatabase() {
  try {
    const batch = writeBatch(db);

    // Seed vendors
    const vendorsCollection = collection(db, 'vendors');
    vendors.forEach((vendorData: Vendor) => {
      // Don't include nested products array in the vendor document
      const { products, ...vendor } = vendorData;
      const docRef = doc(vendorsCollection, vendor.id);
      batch.set(docRef, vendor);
    });

    // Seed products
    const productsCollection = collection(db, 'products');
    products.forEach(product => {
      const docRef = doc(productsCollection, product.id);
      batch.set(docRef, product);
    });

    // Seed users
    const usersCollection = collection(db, 'users');
    users.forEach(user => {
      const docRef = doc(usersCollection, user.id);
      batch.set(docRef, user);
    });

    // Seed riders
    const ridersCollection = collection(db, 'riders');
    riders.forEach(rider => {
      const docRef = doc(ridersCollection, rider.id);
      batch.set(docRef, rider);
    });

    // Seed orders
    const ordersCollection = collection(db, 'orders');
    orders.forEach(orderData => {
        const { user, vendor, items, rider, ...restOfOrder } = orderData;
        const orderDoc = {
            ...restOfOrder,
            userId: user.id,
            vendorId: vendor.id,
            ...(rider && { riderId: rider.id }),
            items: items.map(item => ({
                productId: item.product.id,
                quantity: item.quantity,
                price: item.product.price // Store price at time of order
            }))
        };
        const docRef = doc(ordersCollection, orderData.id);
        batch.set(docRef, orderDoc);
    });

    await batch.commit();

    return { success: true, message: 'Database seeded successfully!' };
  } catch (e: any) {
    console.error("Error seeding database:", e);
    return { success: false, error: e.message || 'An unexpected error occurred during seeding.' };
  }
}


// User Actions
export async function createUser(data: Omit<User, 'id'>) {
    try {
        await addDoc(collection(db, 'users'), data);
        revalidatePath('/admin/users');
        return { success: true, message: 'User created successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateUser(id: string, data: Partial<User>) {
    try {
        await updateDoc(doc(db, 'users', id), data);
        revalidatePath('/admin/users');
        return { success: true, message: 'User updated successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteUser(id: string) {
    try {
        await deleteDoc(doc(db, 'users', id));
        revalidatePath('/admin/users');
        return { success: true, message: 'User deleted successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
