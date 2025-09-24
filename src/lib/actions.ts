
'use server';

import {
  assignBestDeliveryDispatcher,
  type AssignBestDeliveryDispatcherInput,
} from '@/ai/flows/assign-best-delivery-rider';
import { auth, db } from './firebase';
import { collection, writeBatch, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc, Timestamp, collectionGroup, getDocs as getDocsFromFirestore } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { users, vendors, products, dispatchers, orders, getDispatchers } from './data';
import type { User, Vendor, Dispatcher, Product, OrderStatus } from './types';
import { revalidatePath } from 'next/cache';
import { placeholderImages } from './placeholder-images';
import { getServerSession } from './auth';

type CreateOrderData = {
    userId: string;
    items: { productId: string; quantity: number; price: number }[];
    subtotal: number;
    deliveryFee: number;
    total: number;
    deliveryAddress: string;
    vendorId: string;
}

export async function createOrder(orderData: CreateOrderData) {
    try {
        const newOrder = {
            ...orderData,
            status: 'placed' as OrderStatus,
            createdAt: Timestamp.now(),
        };

        const docRef = await addDoc(collection(db, 'orders'), newOrder);

        revalidatePath('/orders');
        revalidatePath(`/orders/${docRef.id}`);
        revalidatePath('/admin');
        revalidatePath(`/vendor/orders`);

        return { success: true, orderId: docRef.id };
    } catch (e: any) {
        console.error("Error creating order:", e);
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}


export async function handleAssignDispatcher(input: AssignBestDeliveryDispatcherInput) {
  try {
    const result = await assignBestDeliveryDispatcher(input);
    return { data: result };
  } catch (e: any) {
    console.error(e);
    return { error: e.message || "An unexpected error occurred." };
  }
}

export async function confirmDispatcherAssignment(orderId: string, dispatcherId: string) {
    try {
        const session = await getServerSession();
        if (!session || (session.user.role !== 'vendor' && session.user.role !== 'admin')) {
            return { success: false, error: 'Unauthorized' };
        }

        await updateDoc(doc(db, 'orders', orderId), {
            dispatcherId,
        });

        revalidatePath(`/vendor/orders/${orderId}`);
        revalidatePath(`/admin`); // Revalidate admin dashboard
        return { success: true, message: 'Dispatcher assigned successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
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
        const docRef = await addDoc(collection(db, 'users'), data);
        revalidatePath('/admin/users');
        revalidatePath('/checkout');
        return { success: true, message: 'User created successfully.', data: { id: docRef.id } };
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
      const newUser: Omit<User, 'id'> = {
        ...data,
        role: 'user',
        avatarUrl: data.avatarUrl || placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '',
        addresses: [],
      };
      await setDoc(userRef, newUser);
      const createdUser = { id, ...newUser } as User;
      revalidatePath('/admin/users');
      return { success: true, data: createdUser };
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
        revalidatePath('/profile');
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

export async function createVendorAndUser(data: {
    name: string;
    email: string;
    password: string;
    shopName: string;
    shopAddress: string;
    shopCategory: 'food' | 'groceries';
}) {
    // This is a temporary admin auth instance.
    // In a real app, this should be handled by a secure backend service, not directly in the client.
    let uid;
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        uid = userCredential.user.uid;
        await updateProfile(userCredential.user, { displayName: data.name });

        const vendorData = {
            name: data.shopName,
            description: `A great place for ${data.shopCategory}.`,
            category: data.shopCategory,
            address: data.shopAddress,
            logoUrl: placeholderImages.find(p => p.id === 'vendor-logo-1')?.imageUrl || '',
            bannerUrl: placeholderImages.find(p => p.id === 'vendor-banner-1')?.imageUrl || '',
            ownerId: uid,
        };
        const vendorDocRef = await addDoc(collection(db, 'vendors'), vendorData);

        const userData: Omit<User, 'id'> = {
            name: data.name,
            email: data.email,
            role: 'vendor',
            avatarUrl: placeholderImages.find(p => p.id === 'user-avatar-1')?.imageUrl || '',
            vendorId: vendorDocRef.id,
        };
        await setDoc(doc(db, "users", uid), userData);

        revalidatePath('/admin/vendors');
        revalidatePath('/admin/users');

        return { success: true, message: 'Vendor account created. Please log in.' };

    } catch (e: any) {
        console.error("Error creating vendor and user:", e);
        if (uid) {
            // In a real app, you would use the Admin SDK to delete the auth user if the DB operations fail.
            // For this project, we'll leave it, but be aware of this in production.
        }
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

// Order Status Action
export async function updateOrderStatus(orderId: string, status: OrderStatus) {
    try {
        const session = await getServerSession();
        if (!session) {
            return { success: false, error: 'Unauthorized' };
        }

        const orderRef = doc(db, 'orders', orderId);
        const orderSnap = await getDoc(orderRef);
        if (!orderSnap.exists()) {
             return { success: false, error: 'Order not found.' };
        }
        const orderData = orderSnap.data();

        // Automatic dispatcher assignment logic
        if (status === 'preparing' && session.user.role === 'vendor' && !orderData.dispatcherId) {
            const allDispatchers = await getDispatchers();
            const availableDispatchers = allDispatchers.filter(d => d.status === 'available');

            if (availableDispatchers.length > 0) {
                const assignmentResult = await assignBestDeliveryDispatcher({
                    orderId: orderId,
                    vendorId: orderData.vendorId,
                    deliveryLocation: orderData.deliveryAddress,
                    eligibleDispatcherIds: availableDispatchers.map(d => d.id),
                });
                
                if (assignmentResult.dispatcherId) {
                    await updateDoc(orderRef, { status, dispatcherId: assignmentResult.dispatcherId });
                } else {
                     await updateDoc(orderRef, { status });
                }
            } else {
                 await updateDoc(orderRef, { status });
            }
        } else {
            await updateDoc(orderRef, { status });
        }
        
        revalidatePath(`/vendor/orders`);
        revalidatePath(`/vendor/orders/${orderId}`);
        revalidatePath(`/dispatcher`);
        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/admin');

        return { success: true, message: `Order status updated to ${status}.` };
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
        revalidatePath('/vendor/settings');
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

// Product Actions
export async function createProduct(data: Omit<Product, 'id'>) {
    try {
        await addDoc(collection(db, 'products'), data);
        revalidatePath('/vendor/products');
        return { success: true, message: 'Product created successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>) {
    try {
        await updateDoc(doc(db, 'products', id), data);
        revalidatePath('/vendor/products');
        return { success: true, message: 'Product updated successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteProduct(id: string) {
    try {
        await deleteDoc(doc(db, 'products', id));
        revalidatePath('/vendor/products');
        return { success: true, message: 'Product deleted successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}
