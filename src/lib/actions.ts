
'use server';

import { auth, db } from './firebase';
import { collection, writeBatch, doc, addDoc, updateDoc, deleteDoc, getDoc, setDoc, Timestamp, collectionGroup, getDocs as getDocsFromFirestore, query, where, orderBy, runTransaction } from 'firebase/firestore';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import type { User, Vendor, Dispatcher, Product, OrderStatus, ChatMessage, DispatcherVehicle, Order } from './types';
import { revalidatePath } from 'next/cache';
import { getPlaceholderImage } from './placeholder-images';
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
  const findImage = (id: string) => getPlaceholderImage(id);

  const users: User[] = [
    { id: 'user-1', name: 'John Doe', email: 'john.doe@example.com', role: 'user', avatarUrl: findImage('user-avatar-1'), phoneNumber: '+2348012345678', addresses: ['123 Main St, Calabar, Nigeria'] },
    { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user', avatarUrl: findImage('user-avatar-2'), phoneNumber: '+2348012345679', addresses: ['456 Oak Ave, Calabar, Nigeria', '789 Pine Ln, Calabar, Nigeria'] },
    { id: 'vendor-admin-1', name: 'Burger Queen Admin', email: 'admin@burgerqueen.com', role: 'vendor', avatarUrl: findImage('vendor-logo-1'), vendorId: 'vendor-1' },
    { id: 'admin-1', name: 'App Admin', email: 'admin@calabarmarket.com', role: 'admin', avatarUrl: findImage('user-avatar-1') },
    { id: 'dispatcher-1-uid', name: 'Mike Ross', email: 'mike.ross@example.com', role: 'dispatcher', dispatcherId: 'dispatcher-1', avatarUrl: findImage('rider-avatar-1') },
    { id: 'dispatcher-2-uid', name: 'Sarah Lance', email: 'sarah.lance@example.com', role: 'dispatcher', dispatcherId: 'dispatcher-2', avatarUrl: findImage('rider-avatar-2') },
    { id: 'dispatcher-3-uid', name: 'Peter Pan', email: 'peter.pan@example.com', role: 'dispatcher', dispatcherId: 'dispatcher-3', avatarUrl: findImage('user-avatar-1') },
    { id: 'dispatcher-4-uid', name: 'Wendy Darling', email: 'wendy.darling@example.com', role: 'dispatcher', dispatcherId: 'dispatcher-4', avatarUrl: findImage('user-avatar-2') },
    { id: 'bill-james-user', name: 'Bill James', email: 'omorakabenjamin1@gmail.com', role: 'dispatcher', dispatcherId: 'bill-james-dispatcher', avatarUrl: findImage('user-avatar-1') },
  ];

  const mockDispatchers: Dispatcher[] = [
      { id: 'dispatcher-1', name: 'Mike Ross', avatarUrl: findImage('rider-avatar-1'), vehicle: 'motorbike', location: 'Downtown', status: 'available', rating: 4.8, completedDispatches: 102, phoneNumber: '+2348022222222' },
      { id: 'dispatcher-2', name: 'Sarah Lance', avatarUrl: findImage('rider-avatar-2'), vehicle: 'bicycle', location: 'Uptown', status: 'available', rating: 4.9, completedDispatches: 250, phoneNumber: '+2348033333333' },
      { id: 'dispatcher-3', name: 'Peter Pan', avatarUrl: findImage('user-avatar-1'), vehicle: 'motorbike', location: 'Midtown', status: 'unavailable', rating: 4.5, completedDispatches: 55, phoneNumber: '+2348044444444' },
      { id: 'dispatcher-4', name: 'Wendy Darling', avatarUrl: findImage('user-avatar-2'), vehicle: 'motorbike', location: 'Downtown', status: 'on-delivery', rating: 4.7, completedDispatches: 89, phoneNumber: '+2348055555555' },
      { id: 'bill-james-dispatcher', name: 'Bill James', avatarUrl: findImage('user-avatar-1'), vehicle: 'car', location: 'City Center', status: 'available', rating: 5.0, completedDispatches: 0, phoneNumber: '+2348011111111' },
  ];

  const products: Product[] = [
    // Vendor 1: Burger Queen
    { id: 'prod-1', vendorId: 'vendor-1', name: 'Classic Burger', description: 'A delicious classic beef burger.', price: 8.99, stock: 100, imageUrl: findImage('product-burger') },
    { id: 'prod-2', vendorId: 'vendor-1', name: 'Cheese Burger', description: 'Classic burger with a slice of cheddar.', price: 9.99, stock: 80, imageUrl: findImage('product-burger') },
    { id: 'prod-11', vendorId: 'vendor-1', name: 'French Fries', description: 'Crispy golden french fries.', price: 3.99, stock: 200, imageUrl: "https://picsum.photos/seed/fries/400/300" },
  
    // Vendor 2: Pizza Palace
    { id: 'prod-3', vendorId: 'vendor-2', name: 'Pepperoni Pizza', description: 'Classic pizza with pepperoni.', price: 12.99, stock: 50, imageUrl: findImage('product-pizza') },
    { id: 'prod-4', vendorId: 'vendor-2', name: 'Margherita Pizza', description: 'Simple and delicious tomato and cheese pizza.', price: 10.99, stock: 60, imageUrl: findImage('product-pizza') },
    { id: 'prod-12', vendorId: 'vendor-2', name: 'Garlic Bread', description: 'Warm bread with garlic butter.', price: 4.99, stock: 70, imageUrl: "https://picsum.photos/seed/garlicbread/400/300" },
    
    // Vendor 3: Green Grocer
    { id: 'prod-5', vendorId: 'vendor-3', name: 'Fresh Apples', description: 'A bag of crisp red apples.', price: 4.99, stock: 200, imageUrl: findImage('product-apples') },
    { id: 'prod-6', vendorId: 'vendor-3', name: 'Sourdough Bread', description: 'A loaf of freshly baked sourdough bread.', price: 5.49, stock: 40, imageUrl: findImage('product-bread') },
    { id: 'prod-13', vendorId: 'vendor-3', name: 'Organic Carrots', description: 'A bunch of fresh organic carrots.', price: 2.99, stock: 150, imageUrl: "https://picsum.photos/seed/carrots/400/300" },
    { id: 'prod-14', vendorId: 'vendor-3', name: 'Fresh Milk', description: '1 litre of fresh pasteurized milk.', price: 1.99, stock: 100, imageUrl: "https://picsum.photos/seed/milk/400/300" },
    
    // Vendor 4: Sushi Spot
    { id: 'prod-7', vendorId: 'vendor-4', name: 'Salmon Roll', description: 'Fresh salmon and avocado.', price: 11.99, stock: 30, imageUrl: "https://picsum.photos/seed/sushi1/400/300" },
    { id: 'prod-8', vendorId: 'vendor-4', name: 'Tuna Nigiri', description: 'Slices of fresh tuna over rice.', price: 14.99, stock: 25, imageUrl: "https://picsum.photos/seed/sushi2/400/300" },
  
    // Vendor 5: Taco Town
    { id: 'prod-9', vendorId: 'vendor-5', name: 'Beef Tacos', description: 'Three crispy tacos with seasoned beef.', price: 9.99, stock: 60, imageUrl: "https://picsum.photos/seed/tacos1/400/300" },
    { id: 'prod-10', vendorId: 'vendor-5', name: 'Chicken Burrito', description: 'A large burrito filled with chicken and rice.', price: 12.99, stock: 40, imageUrl: "https://picsum.photos/seed/burrito1/400/300" },
  ];

  const vendors: Omit<Vendor, 'products'>[] = [
    {
      id: 'vendor-1',
      name: 'Burger Queen',
      description: 'The best burgers in town.',
      category: 'food',
      address: '100 Burger Lane, Calabar',
      logoUrl: findImage('vendor-logo-1'),
      bannerUrl: findImage('vendor-banner-1'),
    },
    {
      id: 'vendor-2',
      name: 'Pizza Palace',
      description: 'Authentic Italian pizza.',
      category: 'food',
      address: '200 Pizza Plaza, Calabar',
      logoUrl: findImage('vendor-logo-2'),
      bannerUrl: findImage('vendor-banner-2'),
    },
    {
      id: 'vendor-3',
      name: 'Green Grocer',
      description: 'Fresh and organic groceries.',
      category: 'groceries',
      address: '300 Farm Road, Calabar',
      logoUrl: findImage('vendor-logo-3'),
      bannerUrl: findImage('vendor-banner-3'),
    },
    {
      id: 'vendor-4',
      name: 'Sushi Spot',
      description: 'Fresh and delicious sushi.',
      category: 'food',
      address: '400 Ocean View, Calabar',
      logoUrl: "https://picsum.photos/seed/sushilogo/100/100",
      bannerUrl: "https://picsum.photos/seed/sushibanner/600/400",
    },
    {
      id: 'vendor-5',
      name: 'Taco Town',
      description: 'Your favorite Mexican street food.',
      category: 'food',
      address: '500 Fiesta Way, Calabar',
      logoUrl: "https://picsum.photos/seed/tacologo/100/100",
      bannerUrl: "https://picsum.photos/seed/tacobanner/600/400",
    },
  ];

  const orders: any[] = [ // Using any for seeding simplicity
      {
          id: 'order-placed-1',
          user: users.find(u => u.id === 'user-1'),
          vendor: vendors[0],
          items: [{ product: products[0], quantity: 1 }],
          status: 'placed',
          deliveryAddress: '123 Main St, Calabar, Nigeria',
          createdAt: new Date(Date.now() - 3600000 * 0.1).toISOString(),
          subtotal: 8.99,
          deliveryFee: 3.00,
          total: 11.99,
      },
      {
          id: 'order-preparing-1',
          user: users.find(u => u.id === 'user-2'),
          vendor: vendors[1],
          items: [{ product: products[2], quantity: 2 }],
          status: 'preparing',
          deliveryAddress: '456 Oak Ave, Calabar, Nigeria',
          createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
          subtotal: 25.98,
          deliveryFee: 4.00,
          total: 29.98,
      },
       {
          id: 'order-dispatched-1',
          user: users.find(u => u.id === 'user-1'),
          vendor: vendors[4],
          items: [{ product: products[9], quantity: 1 }, { product: products[8], quantity: 2 }],
          status: 'dispatched',
          deliveryAddress: '123 Main St, Calabar, Nigeria',
          createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
          dispatcher: mockDispatchers.find(d => d.id === 'dispatcher-4'),
          subtotal: 42.97,
          deliveryFee: 5.00,
          total: 47.97,
      },
      {
          id: 'order-delivered-1',
          user: users.find(u => u.id === 'user-2'),
          vendor: vendors[3],
          items: [{ product: products[6], quantity: 2 }, { product: products[7], quantity: 1 }],
          status: 'delivered',
          deliveryAddress: '456 Oak Ave, Calabar, Nigeria',
          createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
          dispatcher: mockDispatchers.find(d => d.id === 'dispatcher-2'),
          subtotal: 38.97,
          deliveryFee: 4.50,
          total: 43.47,
      },
      {
          id: 'order-cancelled-1',
          user: users.find(u => u.id === 'user-1'),
          vendor: vendors[2],
          items: [{ product: products[4], quantity: 10 }],
          status: 'cancelled',
          deliveryAddress: '123 Main St, Calabar, Nigeria',
          createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
          subtotal: 49.90,
          deliveryFee: 5.50,
          total: 55.40,
      },
      {
          id: 'order-delivered-2',
          user: users.find(u => u.id === 'user-1'),
          vendor: vendors[1],
          items: [{ product: products[2], quantity: 1 }, { product: products[3], quantity: 1 }],
          status: 'delivered',
          deliveryAddress: '789 Pine Ln, Calabar, Nigeria',
          createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
          dispatcher: mockDispatchers.find(d => d.id === 'dispatcher-1'),
          subtotal: 23.98,
          deliveryFee: 5.00,
          total: 28.98,
      },
  ];

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
      const user = { id: userSnap.id, ...userSnap.data() } as User;
      
      if (user.role === 'vendor' && user.vendorId) {
        const vendorProfile = await fetchDocumentById<Vendor>('vendors', user.vendorId);
        if (vendorProfile) {
          user.vendorId = vendorProfile.id;
        }
      } else if (user.role === 'dispatcher' && user.dispatcherId) {
        const dispatcherProfile = await fetchDocumentById<Dispatcher>('dispatchers', user.dispatcherId);
        if (dispatcherProfile) {
          (user as any).dispatcher = dispatcherProfile;
        }
      }
      return { success: true, data: user };
    } else {
      const newUser: Omit<User, 'id'> = {
        ...data,
        role: 'user',
        avatarUrl: data.avatarUrl || getPlaceholderImage('user-avatar-1'),
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
            logoUrl: getPlaceholderImage('vendor-logo-1'),
            bannerUrl: getPlaceholderImage('vendor-banner-1'),
            ownerId: uid,
        };
        const vendorDocRef = await addDoc(collection(db, 'vendors'), vendorData);

        const userData: Omit<User, 'id'> = {
            name: data.name,
            email: data.email,
            role: 'vendor',
            avatarUrl: getPlaceholderImage('user-avatar-1'),
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
            avatarUrl: getPlaceholderImage('rider-avatar-1'),
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
        if (uid) {
            // In a real app, you would use the Admin SDK to delete the auth user if the DB operations fail.
        }
        return { success: false, error: e.message || 'An unexpected error occurred.' };
    }
}

// Vendor Actions
export async function createVendor(data: Omit<Vendor, 'id' | 'products'>) {
    try {
        const session = await getServerSession();
        if (!session || session.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }

        const vendorData = { ...data, products: [] };
        await addDoc(collection(db, 'vendors'), vendorData);
        revalidatePath('/admin/vendors');
        return { success: true, message: 'Vendor created successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateVendor(id: string, data: Partial<Omit<Vendor, 'id' | 'products'>>) {
    try {
        const session = await getServerSession();
        if (!session || (session.user.role !== 'admin' && session.vendorId !== id)) {
            throw new Error('Unauthorized');
        }

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
         const session = await getServerSession();
        if (!session || session.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        await deleteDoc(doc(db, 'vendors', id));
        // Also delete associated products
        const productsQuery = query(collection(db, 'products'), where('vendorId', '==', id));
        const productsSnapshot = await getDocsFromFirestore(productsQuery);
        const batch = writeBatch(db);
        productsSnapshot.forEach(doc => batch.delete(doc.ref));
        await batch.commit();

        revalidatePath('/admin/vendors');
        return { success: true, message: 'Vendor deleted successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Product Actions
export async function createProduct(data: Omit<Product, 'id'>) {
    try {
        const session = await getServerSession();
        if (!session || (session.user.role !== 'admin' && session.vendorId !== data.vendorId)) {
            throw new Error('Unauthorized');
        }

        await addDoc(collection(db, 'products'), data);
        revalidatePath('/vendor/products');
        revalidatePath('/admin/vendors');
        return { success: true, message: 'Product created successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateProduct(id: string, data: Partial<Product>) {
    try {
        const session = await getServerSession();
        const product = await getDoc(doc(db, 'products', id));
        if(!product.exists()) throw new Error('Product not found');

        const productData = product.data();
        if (!session || (session.user.role !== 'admin' && session.vendorId !== productData.vendorId)) {
            throw new Error('Unauthorized');
        }
        await updateDoc(doc(db, 'products', id), data);
        revalidatePath('/vendor/products');
        revalidatePath('/admin/vendors');
        return { success: true, message: 'Product updated successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteProduct(id: string) {
    try {
        const session = await getServerSession();
        const product = await getDoc(doc(db, 'products', id));
        if(!product.exists()) throw new Error('Product not found');

        const productData = product.data();
        if (!session || (session.user.role !== 'admin' && session.vendorId !== productData.vendorId)) {
            throw new Error('Unauthorized');
        }

        await deleteDoc(doc(db, 'products', id));
        revalidatePath('/vendor/products');
        revalidatePath('/admin/vendors');
        return { success: true, message: 'Product deleted successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Dispatcher Actions
export async function createDispatcher(data: Omit<Dispatcher, 'id'>) {
    try {
        const session = await getServerSession();
        if (!session || session.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        await addDoc(collection(db, 'dispatchers'), data);
        revalidatePath('/admin/riders');
        return { success: true, message: 'Dispatcher created successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function updateDispatcher(id: string, data: Partial<Dispatcher>) {
    try {
         const session = await getServerSession();
        if (!session || session.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        await updateDoc(doc(db, 'dispatchers', id), data);
        revalidatePath('/admin/riders');
        return { success: true, message: 'Dispatcher updated successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function deleteDispatcher(id: string) {
    try {
         const session = await getServerSession();
        if (!session || session.user.role !== 'admin') {
            throw new Error('Unauthorized');
        }
        await deleteDoc(doc(db, 'dispatchers', id));
        revalidatePath('/admin/riders');
        return { success: true, message: 'Dispatcher deleted successfully.' };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

// Order Status
export async function updateOrderStatus(orderId: string, status: OrderStatus, dispatcherId?: string) {
    try {
        const orderRef = doc(db, 'orders', orderId);
        const updateData: any = { status };
        
        // This is the main logic for dispatcher assignment
        if (status === 'preparing' && dispatcherId) {
            updateData.dispatcherId = dispatcherId;
            // Also update the dispatcher's status to 'on-delivery'
            const dispatcherRef = doc(db, 'dispatchers', dispatcherId);
            await updateDoc(dispatcherRef, { status: 'on-delivery' });
            revalidatePath('/admin/riders');
        }

        // When order is delivered or cancelled, make dispatcher available again
        if (status === 'delivered' || status === 'cancelled') {
            const orderSnap = await getDoc(orderRef);
            const order = orderSnap.data() as Order;
            if (order.dispatcherId) {
                 const dispatcherRef = doc(db, 'dispatchers', order.dispatcherId);
                 
                 if (status === 'delivered') {
                    const dispatcherSnap = await getDoc(dispatcherRef);
                    if (dispatcherSnap.exists()) {
                        const dispatcherData = dispatcherSnap.data() as Dispatcher;
                        await updateDoc(dispatcherRef, { 
                            status: 'available',
                            completedDispatches: (dispatcherData.completedDispatches || 0) + 1 
                        });
                    }
                 } else {
                     await updateDoc(dispatcherRef, { status: 'available' });
                 }
                 revalidatePath('/admin/riders');
            }
        }


        await updateDoc(orderRef, updateData);

        revalidatePath(`/orders/${orderId}`);
        revalidatePath(`/vendor/orders`);
        revalidatePath(`/vendor/orders/${orderId}`);
        revalidatePath('/dispatcher');
        revalidatePath('/admin');
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function rateDispatcher(orderId: string, dispatcherId: string, rating: number) {
  try {
    const session = await getServerSession();
    const orderRef = doc(db, 'orders', orderId);
    const orderSnap = await getDoc(orderRef);
    const orderData = orderSnap.data() as Order;

    if (!session || session.user.id !== orderData.userId) {
      throw new Error('Unauthorized');
    }
    if (orderData.dispatcherRating) {
      throw new Error('This order has already been rated.');
    }
    
    // Update the rating on the order itself
    await updateDoc(orderRef, { dispatcherRating: rating });

    // Update the dispatcher's average rating
    const dispatcherRef = doc(db, 'dispatchers', dispatcherId);
    await runTransaction(db, async (transaction) => {
      const dispatcherSnap = await transaction.get(dispatcherRef);
      if (!dispatcherSnap.exists()) {
        throw new Error("Dispatcher not found!");
      }
      const dispatcherData = dispatcherSnap.data() as Dispatcher;
      const oldRating = dispatcherData.rating || 0;
      const completedDispatches = dispatcherData.completedDispatches || 0;
      
      const newTotalRatingPoints = (oldRating * completedDispatches) + rating;
      const newAverageRating = newTotalRatingPoints / (completedDispatches + 1);

      transaction.update(dispatcherRef, { rating: newAverageRating });
    });


    revalidatePath(`/orders/${orderId}`);
    revalidatePath('/dispatcher');

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}


// Chat Actions
export async function sendMessage(data: Omit<ChatMessage, 'id' | 'timestamp'>) {
    try {
        const { orderId, ...messageData } = data;
        if (!orderId) {
            throw new Error('Order ID is required to send a message.');
        }
        const message = {
            ...messageData,
            timestamp: Timestamp.now(),
        };
        await addDoc(collection(db, `orders/${orderId}/messages`), message);
        return { success: true };
    } catch (e: any) {
        return { success: false, error: e.message };
    }
}

export async function getMessages(orderId: string): Promise<ChatMessage[]> {
    try {
        if (!orderId) return [];
        const q = query(collection(db, `orders/${orderId}/messages`), orderBy('timestamp', 'asc'));
        const querySnapshot = await getDocsFromFirestore(q);
        return querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                timestamp: data.timestamp.toDate().toISOString(),
            } as ChatMessage;
        });
    } catch (e: any) {
        console.error("Error getting messages:", e);
        return [];
    }
}
