

'use server';

import {
  assignBestDeliveryDispatcher,
  type AssignBestDeliveryDispatcherInput,
} from '@/ai/flows/assign-best-delivery-rider';
import { db } from './firebase';
import { collection, writeBatch, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc, Timestamp } from 'firebase/firestore';
import { users, vendors, products, dispatchers, orders } from './data';
import type { User, Vendor, Dispatcher } from './types';
import { revalidatePath } from 'next/cache';
import { placeholderImages } from './placeholder-images';


export async function handleAssignDispatcher(input: AssignBestDeliveryDispatcherInput) {
  try {
    const result = await assignBestDeliveryDispatcher(input);
    // In a real app, you would update your database with the assignment here.
    // For example: await db.updateOrder(input.orderId, { dispatcherId: result.dispatcherId });
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
    vendors.forEach((vendorData: Omit<Vendor, 'products'>) => {
      const docRef = doc(vendorsCollection, vendorData.id);
      batch.set(docRef, vendorData);
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

    // Seed dispatchers
    const dispatchersCollection = collection(db, 'dispatchers');
    dispatchers.forEach(dispatcher => {
      const docRef = doc(dispatchersCollection, dispatcher.id);
      batch.set(docRef, dispatcher);
    });

    // Seed orders
    const ordersCollection = collection(db, 'orders');
    orders.forEach(orderData => {
        const { user, vendor, items, dispatcher, createdAt, ...restOfOrder } = orderData;
        const orderDoc = {
            ...restOfOrder,
            userId: user.id,
            vendorId: vendor.id,
            ...(dispatcher && { dispatcherId: dispatcher.id }),
            createdAt: Timestamp.fromDate(new Date(createdAt)),
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

    revalidatePath('/', 'layout');

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
        revalidatePath('/checkout');
        return { success: true, message: 'User created successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getOrCreateUser(
  id: string,
  data: Omit<User, 'id' | 'role'>
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const user = { id: userSnap.id, ...userSnap.data() } as User;
      return { success: true, data: user };
    } else {
      const newUser: User = {
        id,
        ...data,
        role: 'user',
        avatarUrl: data.avatarUrl || placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '',
        addresses: [],
      };
      await setDoc(userRef, newUser);
      revalidatePath('/admin/users');
      return { success: true, data: newUser };
    }
  } catch (e: any) {
    console.error("Error in getOrCreateUser:", e);
    return { success: false, error: e.message };
  }
}


export async function updateUser(id: string, data: Partial<User>) {
    try {
        await updateDoc(doc(db, 'users', id), data);
        revalidatePath('/admin/users');
        revalidatePath('/checkout');
        return { success: true, message: 'User updated successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteUser(id: string) {
    try {
        await deleteDoc(doc(db, 'users', id));
        revalidatePath('/admin/users');
        revalidatePath('/checkout');
        return { success: true, message: 'User deleted successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Vendor Actions
export async function createVendor(data: Omit<Vendor, 'id' | 'products'>) {
    try {
        await addDoc(collection(db, 'vendors'), data);
        revalidatePath('/admin/vendors');
        return { success: true, message: 'Vendor created successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateVendor(id: string, data: Partial<Omit<Vendor, 'id' | 'products'>>) {
    try {
        await updateDoc(doc(db, 'vendors', id), data);
        revalidatePath('/admin/vendors');
        revalidatePath(`/browse/vendors/${id}`);
        return { success: true, message: 'Vendor updated successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteVendor(id: string) {
    try {
        // Note: In a real app, you might want to handle what happens to products of a deleted vendor.
        await deleteDoc(doc(db, 'vendors', id));
        revalidatePath('/admin/vendors');
        revalidatePath('/browse');
        return { success: true, message: 'Vendor deleted successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Dispatcher Actions
export async function createDispatcher(data: Omit<Dispatcher, 'id'>) {
    try {
        await addDoc(collection(db, 'dispatchers'), data);
        revalidatePath('/admin/riders');
        return { success: true, message: 'Dispatcher created successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateDispatcher(id: string, data: Partial<Omit<Dispatcher, 'id'>>) {
    try {
        await updateDoc(doc(db, 'dispatchers', id), data);
        revalidatePath('/admin/riders');
        return { success: true, message: 'Dispatcher updated successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteDispatcher(id: string) {
    try {
        await deleteDoc(doc(db, 'dispatchers', id));
        revalidatePath('/admin/riders');
        return { success: true, message: 'Dispatcher deleted successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
