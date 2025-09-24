

import type { User, Vendor, Product, Order, Dispatcher, OrderItem, OrderStatus } from './types';
import { placeholderImages } from './placeholder-images';
import { db } from './firebase';
import { collection, getDocs, getDoc, doc, query, where, Timestamp } from 'firebase/firestore';

const findImage = (id: string) => placeholderImages.find(p => p.id === id)?.imageUrl || '';

// --- Mock Data (for seeding) ---
export const users: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john.doe@example.com', role: 'user', avatarUrl: findImage('user-avatar-1'), phoneNumber: '+2348012345678', addresses: ['123 Main St, Calabar, Nigeria'] },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user', avatarUrl: findImage('user-avatar-2'), phoneNumber: '+2348012345679', addresses: ['456 Oak Ave, Calabar, Nigeria', '789 Pine Ln, Calabar, Nigeria'] },
  { id: 'vendor-admin-1', name: 'Burger Queen Admin', email: 'admin@burgerqueen.com', role: 'vendor', avatarUrl: findImage('vendor-logo-1') },
  { id: 'admin-1', name: 'App Admin', email: 'admin@calabarmarket.com', role: 'admin', avatarUrl: findImage('user-avatar-1') },
];

export const dispatchers: Dispatcher[] = [
    { id: 'dispatcher-1', name: 'Mike Ross', avatarUrl: findImage('rider-avatar-1'), vehicle: 'motorbike', location: 'Downtown', status: 'available', rating: 4.8, completedDispatches: 102 },
    { id: 'dispatcher-2', name: 'Sarah Lance', avatarUrl: findImage('rider-avatar-2'), vehicle: 'bicycle', location: 'Uptown', status: 'available', rating: 4.9, completedDispatches: 250 },
    { id: 'dispatcher-3', name: 'Peter Pan', avatarUrl: findImage('user-avatar-1'), vehicle: 'motorbike', location: 'Midtown', status: 'unavailable', rating: 4.5, completedDispatches: 55 },
    { id: 'dispatcher-4', name: 'Wendy Darling', avatarUrl: findImage('user-avatar-2'), vehicle: 'motorbike', location: 'Downtown', status: 'on-delivery', rating: 4.7, completedDispatches: 89 },
];

export const products: Product[] = [
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

export const vendors: Omit<Vendor, 'products'>[] = [
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

export const orders: any[] = [ // Using any for seeding simplicity
    {
        id: 'order-placed-1',
        user: users[0],
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
        user: users[1],
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
        user: users[0],
        vendor: vendors[4],
        items: [{ product: products[9], quantity: 1 }, { product: products[8], quantity: 2 }],
        status: 'dispatched',
        deliveryAddress: '123 Main St, Calabar, Nigeria',
        createdAt: new Date(Date.now() - 3600000 * 1.2).toISOString(),
        dispatcher: dispatchers[3],
        subtotal: 42.97,
        deliveryFee: 5.00,
        total: 47.97,
    },
    {
        id: 'order-delivered-1',
        user: users[1],
        vendor: vendors[3],
        items: [{ product: products[6], quantity: 2 }, { product: products[7], quantity: 1 }],
        status: 'delivered',
        deliveryAddress: '456 Oak Ave, Calabar, Nigeria',
        createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
        dispatcher: dispatchers[1],
        subtotal: 38.97,
        deliveryFee: 4.50,
        total: 43.47,
    },
    {
        id: 'order-cancelled-1',
        user: users[0],
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
        user: users[0],
        vendor: vendors[1],
        items: [{ product: products[2], quantity: 1 }, { product: products[3], quantity: 1 }],
        status: 'delivered',
        deliveryAddress: '789 Pine Ln, Calabar, Nigeria',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        dispatcher: dispatchers[0],
        subtotal: 23.98,
        deliveryFee: 5.00,
        total: 28.98,
    },
];


// --- Firestore Data Fetching Functions ---

// Helper to convert Firestore Timestamps
function processDoc(doc: any) {
    const data = doc.data();
    // Convert all Timestamp fields to ISO strings
    for (const key in data) {
        if (data[key] instanceof Timestamp) {
            data[key] = data[key].toDate().toISOString();
        }
    }
    return { id: doc.id, ...data };
}


// Generic fetch all documents from a collection
async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => processDoc(doc) as T);
}

// Generic fetch a single document by ID
async function fetchDocumentById<T>(collectionName: string, id: string): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return processDoc(docSnap) as T;
  }
  return null;
}

export async function getVendors(category?: 'food' | 'groceries', includeProducts = false): Promise<Vendor[]> {
  let q = query(collection(db, 'vendors'));
  if (category) {
    q = query(collection(db, 'vendors'), where('category', '==', category));
  }
  const querySnapshot = await getDocs(q);
  const vendorsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Omit<Vendor, 'products'>));
  
  const vendors = await Promise.all(vendorsData.map(async (vendor) => {
    let products: Product[] = [];
    if (includeProducts) {
        products = await getProductsByVendorId(vendor.id);
    }
    return { ...vendor, products };
  }))

  return vendors;
};

export async function getVendorById(id: string): Promise<Vendor | null> {
    const vendor = await fetchDocumentById<Omit<Vendor, 'products'>>('vendors', id);
    if (!vendor) return null;

    const vendorProducts = await getProductsByVendorId(id);

    return { ...vendor, products: vendorProducts };
};

export async function getOrderById(id: string): Promise<Order | null> {
    const orderData = await fetchDocumentById<any>('orders', id);
    if (!orderData) return null;

    // Fetch related documents
    const user = await fetchDocumentById<User>('users', orderData.userId);
    const vendor = await fetchDocumentById<Omit<Vendor, 'products'>>('vendors', orderData.vendorId);
    const dispatcher = orderData.dispatcherId ? await fetchDocumentById<Dispatcher>('dispatchers', orderData.dispatcherId) : undefined;
    
    if (!user || !vendor) return null; // or handle error appropriately

    const items: OrderItem[] = await Promise.all(
        orderData.items.map(async (item: { productId: string; quantity: number }) => {
            const product = await fetchDocumentById<Product>('products', item.productId);
            return { product: product!, quantity: item.quantity };
        })
    );
    
    return {
        ...orderData,
        id: orderData.id,
        user,
        vendor: { ...vendor, products: [] },
        dispatcher,
        items,
        status: orderData.status as OrderStatus,
    } as Order;
}


export const getProductById = async (id: string) => await fetchDocumentById<Product>('products', id);
export const getUserById = async (id: string) => await fetchDocumentById<User>('users', id);
export const getDispatcherById = async (id: string) => await fetchDocumentById<Dispatcher>('dispatchers', id);
export const getDispatchers = async () => await fetchCollection<Dispatcher>('dispatchers');
export const getUsers = async () => await fetchCollection<User>('users');

const processOrderDoc = async (orderDoc: any): Promise<Order> => {
    const orderData = processDoc(orderDoc);
    const user = await fetchDocumentById<User>('users', orderData.userId);
    const vendor = await fetchDocumentById<Omit<Vendor, 'products'>>('vendors', orderData.vendorId);
    
    const items: OrderItem[] = await Promise.all(
        orderData.items.map(async (item: { productId: string; quantity: number, price: number }) => {
            const product = await fetchDocumentById<Product>('products', item.productId);
            return { 
                product: { ...product!, price: item.price || product!.price }, 
                quantity: item.quantity 
            };
        })
    );
    
    const dispatcher = orderData.dispatcherId ? await fetchDocumentById<Dispatcher>('dispatchers', orderData.dispatcherId) : undefined;
    
    return {
        ...orderData,
        user: user!,
        vendor: vendor!,
        dispatcher,
        items: items,
    } as Order;
}

export const getAllOrders = async (): Promise<Order[]> => {
    const q = query(collection(db, 'orders'));
    const querySnapshot = await getDocs(q);
    return Promise.all(querySnapshot.docs.map(processOrderDoc));
}

export const getOrdersByUserId = async (userId: string): Promise<Order[]> => {
    const q = query(collection(db, 'orders'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    return Promise.all(querySnapshot.docs.map(processOrderDoc));
}

export const getOrdersByVendorId = async (vendorId: string): Promise<Order[]> => {
    const q = query(collection(db, 'orders'), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return Promise.all(querySnapshot.docs.map(processOrderDoc));
}

export const getProductsByVendorId = async (vendorId: string): Promise<Product[]> => {
    const q = query(collection(db, 'products'), where('vendorId', '==', vendorId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
}

export const getOrdersByDispatcherId = async (dispatcherId: string): Promise<Order[]> => {
    const q = query(collection(db, 'orders'), where('dispatcherId', '==', dispatcherId));
    const querySnapshot = await getDocs(q);
    return Promise.all(querySnapshot.docs.map(processOrderDoc));
}
    

    


