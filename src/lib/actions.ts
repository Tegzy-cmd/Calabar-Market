
'use server';

import { auth, db } from './firebase';
import { collection, writeBatch, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc, Timestamp, collectionGroup, getDocs as getDocsFromFirestore, query, where, orderBy, runTransaction } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { users, vendors, products, dispatchers as mockDispatchers, orders } from './data';
import type { User, Vendor, Dispatcher, Product, OrderStatus, ChatMessage, DispatcherVehicle, Order } from './types';
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
    mockDispatchers.forEach(dispatcher => {
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

async function fetchDocumentById<T>(collectionName: string, id: string): Promise<T | null> {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  }

export async function getOrCreateUser(
  id: string,
  data: Omit<User, 'id' | 'role' | 'vendorId' | 'dispatcherId'>
): Promise<{ success: boolean; data?: User; error?: string }> {
  try {
    const userRef = doc(db, 'users', id);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      let user = { id: userSnap.id, ...userSnap.data() } as User;
       if (user.role === 'dispatcher' && user.dispatcherId) {
        const dispatcherProfile = await fetchDocumentById<Dispatcher>('dispatchers', user.dispatcherId);
        if (dispatcherProfile) {
          // This part is for client-side context, not how it's stored in DB
          (user as any).dispatcher = dispatcherProfile;
        }
      }
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


export async function createDispatcherAndUser(data: {
    name: string;
    email: string;
    password: string;
    phoneNumber: string;
    vehicle: DispatcherVehicle;
}) {
    let uid;
    try {
        // 1. Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
        uid = userCredential.user.uid;
        await updateProfile(userCredential.user, { displayName: data.name });

        // 2. Create Dispatcher document (using UID as doc ID)
        const dispatcherData: Omit<Dispatcher, 'id'> = {
            name: data.name,
            phoneNumber: data.phoneNumber,
            vehicle: data.vehicle,
            status: 'unavailable',
            location: 'Not Available',
            rating: 5,
            completedDispatches: 0,
            avatarUrl: placeholderImages.find(p => p.id === 'rider-avatar-1')?.imageUrl || '',
        };
        await setDoc(doc(db, 'dispatchers', uid), dispatcherData);

        // 3. Create User document with 'dispatcher' role
        const userData: Omit<User, 'id'> = {
            name: data.name,
            email: data.email,
            role: 'dispatcher',
            avatarUrl: dispatcherData.avatarUrl,
            dispatcherId: uid,
        };
        await setDoc(doc(db, 'users', uid), userData);

        revalidatePath('/admin/riders');
        revalidatePath('/admin/users');

        return { success: true, message: 'Dispatcher account created. Please log in.' };

    } catch (e: any) {
        console.error("Error creating dispatcher and user:", e);
        // Basic cleanup attempt
        if (uid) {
            // In a real app, you'd use Admin SDK to delete the user.
        }
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}


// Order Status Action
export async function updateOrderStatus(orderId: string, status: OrderStatus, dispatcherId?: string) {
    try {
        const session = await getServerSession();
        if (!session) {
            return { success: false, error: 'Unauthorized' };
        }

        const orderRef = doc(db, 'orders', orderId);
        
        let updateData: { status: OrderStatus; dispatcherId?: string } = { status };

        // Handle dispatcher assignment when moving to 'preparing'
        if (status === 'preparing') {
             if (dispatcherId) {
                updateData.dispatcherId = dispatcherId;
            } else {
                // Fetch available dispatchers and assign one randomly
                const q = query(collection(db, 'dispatchers'), where('status', '==', 'available'));
                const querySnapshot = await getDocsFromFirestore(q);
                const availableDispatchers = querySnapshot.docs.map(d => d.id);

                if (availableDispatchers.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableDispatchers.length);
                    updateData.dispatcherId = availableDispatchers[randomIndex];
                } else {
                    console.warn('No available dispatchers to assign.');
                    // Don't assign a dispatcher if none are available
                }
            }
        }
        
        await updateDoc(orderRef, updateData);

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
        // In a real app, you might want to create an associated user account.
        // For now, this just creates the dispatcher profile.
        const docRef = await addDoc(collection(db, 'dispatchers'), data);
        revalidatePath('/admin/riders');
        return { success: true, message: 'Dispatcher created successfully.', dispatcherId: docRef.id };
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


// Chat Actions
type SendMessageData = {
    orderId: string;
    text: string;
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'vendor' | 'dispatcher';
}

export async function sendMessage(data: SendMessageData) {
    try {
        const { orderId, ...messageData } = data;
        const message = {
            ...messageData,
            timestamp: Timestamp.now(),
        };
        await addDoc(collection(db, `orders/${orderId}/messages`), message);
        
        // No revalidation needed as we are using real-time listeners on the client
        return { success: true };
    } catch (e: any) {
        console.error("Error sending message:", e);
        return { success: false, error: e.message };
    }
}

export async function getMessages(orderId: string): Promise<ChatMessage[]> {
    try {
        const messagesCol = collection(db, `orders/${orderId}/messages`);
        const q = query(messagesCol, orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocsFromFirestore(q);

        return querySnapshot.docs.map(doc => {
             const data = doc.data();
             return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp.toDate().toISOString(),
             } as ChatMessage
        });
    } catch (e: any) {
        console.error("Error fetching messages:", e);
        return [];
    }
}


export async function rateDispatcher(orderId: string, dispatcherId: string, rating: number) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const dispatcherRef = doc(db, 'dispatchers', dispatcherId);

        await runTransaction(db, async (transaction) => {
            const orderDoc = await transaction.get(orderRef);
            const dispatcherDoc = await transaction.get(dispatcherRef);

            if (!orderDoc.exists() || !dispatcherDoc.exists()) {
                throw new Error("Order or Dispatcher not found.");
            }

            const orderData = orderDoc.data() as Order;
            if (orderData.dispatcherRating) {
                throw new Error("This order has already been rated.");
            }

            const dispatcherData = dispatcherDoc.data() as Dispatcher;

            // Calculate new average rating
            const currentRatingTotal = dispatcherData.rating * dispatcherData.completedDispatches;
            const newCompletedDispatches = dispatcherData.completedDispatches + 1;
            const newAverageRating = (currentRatingTotal + rating) / newCompletedDispatches;

            // Update dispatcher
            transaction.update(dispatcherRef, {
                rating: newAverageRating,
                // In a real app, you might want to increment completed dispatches when the order is 'delivered',
                // not when rated, but this is fine for the demo.
            });

            // Update order to mark as rated
            transaction.update(orderRef, {
                dispatcherRating: rating,
            });
        });
        
        revalidatePath(`/orders/${orderId}`);
        revalidatePath('/dispatcher');
        revalidatePath('/admin/riders');

        return { success: true, message: "Thank you for your feedback!" };

    } catch (e: any) {
        console.error("Error rating dispatcher:", e);
        return { success: false, error: e.message || "An unexpected error occurred." };
    }
}
    
