import type { User, Vendor, Product, Order, Rider, OrderItem, OrderStatus } from './types';
import { placeholderImages } from './placeholder-images';
import { db } from './firebase';
import { collection, getDocs, getDoc, doc, query, where } from 'firebase/firestore';

const findImage = (id: string) => placeholderImages.find(p => p.id === id)?.imageUrl || '';

// --- Mock Data (for seeding) ---
export const users: User[] = [
  { id: 'user-1', name: 'John Doe', email: 'john.doe@example.com', role: 'user', avatarUrl: findImage('user-avatar-1') },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com', role: 'user', avatarUrl: findImage('user-avatar-2') },
  { id: 'vendor-admin-1', name: 'Burger Queen Admin', email: 'admin@burgerqueen.com', role: 'vendor', avatarUrl: findImage('vendor-logo-1') },
  { id: 'admin-1', name: 'App Admin', email: 'admin@calabareats.com', role: 'admin', avatarUrl: findImage('user-avatar-1') },
];

export const riders: Rider[] = [
    { id: 'rider-1', name: 'Mike Ross', avatarUrl: findImage('rider-avatar-1'), vehicle: 'Motorcycle', location: 'Downtown', status: 'available' },
    { id: 'rider-2', name: 'Sarah Lance', avatarUrl: findImage('rider-avatar-2'), vehicle: 'Bicycle', location: 'Uptown', status: 'available' },
    { id: 'rider-3', name: 'Peter Pan', avatarUrl: findImage('user-avatar-1'), vehicle: 'Motorcycle', location: 'Midtown', status: 'unavailable' },
    { id: 'rider-4', name: 'Wendy Darling', avatarUrl: findImage('user-avatar-2'), vehicle: 'Motorcycle', location: 'Downtown', status: 'on-delivery' },
];

export const products: Product[] = [
  { id: 'prod-1', vendorId: 'vendor-1', name: 'Classic Burger', description: 'A delicious classic beef burger.', price: 8.99, stock: 100, imageUrl: findImage('product-burger') },
  { id: 'prod-2', vendorId: 'vendor-1', name: 'Cheese Burger', description: 'Classic burger with a slice of cheddar.', price: 9.99, stock: 80, imageUrl: findImage('product-burger') },
  { id: 'prod-3', vendorId: 'vendor-2', name: 'Pepperoni Pizza', description: 'Classic pizza with pepperoni.', price: 12.99, stock: 50, imageUrl: findImage('product-pizza') },
  { id: 'prod-4', vendorId: 'vendor-2', name: 'Margherita Pizza', description: 'Simple and delicious tomato and cheese pizza.', price: 10.99, stock: 60, imageUrl: findImage('product-pizza') },
  { id: 'prod-5', vendorId: 'vendor-3', name: 'Fresh Apples', description: 'A bag of crisp red apples.', price: 4.99, stock: 200, imageUrl: findImage('product-apples') },
  { id: 'prod-6', vendorId: 'vendor-3', name: 'Sourdough Bread', description: 'A loaf of freshly baked sourdough bread.', price: 5.49, stock: 40, imageUrl: findImage('product-bread') },
];

export const vendors: Omit<Vendor, 'products'>[] = [
  {
    id: 'vendor-1',
    name: 'Burger Queen',
    description: 'The best burgers in town.',
    category: 'food',
    logoUrl: findImage('vendor-logo-1'),
    bannerUrl: findImage('vendor-banner-1'),
  },
  {
    id: 'vendor-2',
    name: 'Pizza Palace',
    description: 'Authentic Italian pizza.',
    category: 'food',
    logoUrl: findImage('vendor-logo-2'),
    bannerUrl: findImage('vendor-banner-2'),
  },
  {
    id: 'vendor-3',
    name: 'Green Grocer',
    description: 'Fresh and organic groceries.',
    category: 'groceries',
    logoUrl: findImage('vendor-logo-3'),
    bannerUrl: findImage('vendor-banner-3'),
  },
];

export const orders: any[] = [ // Using any for seeding simplicity
    {
        id: 'order-12345',
        user: users[0],
        vendor: vendors[0],
        items: [{ product: products[0], quantity: 2 }],
        status: 'preparing',
        deliveryAddress: '123 Main St, Calabar, Nigeria',
        createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
        subtotal: 17.98,
        deliveryFee: 3.00,
        total: 20.98,
    },
    {
        id: 'order-67890',
        user: users[1],
        vendor: vendors[2],
        items: [
            { product: products[4], quantity: 1 },
            { product: products[5], quantity: 1 },
        ],
        status: 'delivered',
        deliveryAddress: '456 Oak Ave, Calabar, Nigeria',
        createdAt: new Date(Date.now() - 3600000 * 25).toISOString(),
        rider: riders[1],
        subtotal: 10.48,
        deliveryFee: 4.50,
        total: 14.98,
    },
     {
        id: 'order-abcde',
        user: users[0],
        vendor: vendors[1],
        items: [{ product: products[2], quantity: 1 }, { product: products[3], quantity: 1 }],
        status: 'delivered',
        deliveryAddress: '789 Pine Ln, Calabar, Nigeria',
        createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
        rider: riders[0],
        subtotal: 23.98,
        deliveryFee: 5.00,
        total: 28.98,
    },
];


// --- Firestore Data Fetching Functions ---

// Generic fetch all documents from a collection
async function fetchCollection<T>(collectionName: string): Promise<T[]> {
  const querySnapshot = await getDocs(collection(db, collectionName));
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
}

// Generic fetch a single document by ID
async function fetchDocumentById<T>(collectionName: string, id: string): Promise<T | null> {
  const docRef = doc(db, collectionName, id);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as T;
  }
  return null;
}

export async function getVendors(category?: 'food' | 'groceries'): Promise<Vendor[]> {
  let q = query(collection(db, 'vendors'));
  if (category) {
    q = query(collection(db, 'vendors'), where('category', '==', category));
  }
  const querySnapshot = await getDocs(q);
  const vendors = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), products:[] } as Vendor));
  return vendors;
};

export async function getVendorById(id: string): Promise<Vendor | null> {
    const vendor = await fetchDocumentById<Omit<Vendor, 'products'>>('vendors', id);
    if (!vendor) return null;

    const productsQuery = query(collection(db, 'products'), where('vendorId', '==', id));
    const productsSnapshot = await getDocs(productsQuery);
    const vendorProducts = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));

    return { ...vendor, products: vendorProducts };
};

export async function getOrderById(id: string): Promise<Order | null> {
    const orderData = await fetchDocumentById<any>('orders', id);
    if (!orderData) return null;

    // Fetch related documents
    const user = await fetchDocumentById<User>('users', orderData.userId);
    const vendor = await fetchDocumentById<Omit<Vendor, 'products'>>('vendors', orderData.vendorId);
    const rider = orderData.riderId ? await fetchDocumentById<Rider>('riders', orderData.riderId) : undefined;
    
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
        rider,
        items,
        status: orderData.status as OrderStatus,
    } as Order;
}


export const getProductById = async (id: string) => await fetchDocumentById<Product>('products', id);
export const getRiders = async () => await fetchCollection<Rider>('riders');
export const getUsers = async () => await fetchCollection<User>('users');
export const getAllOrders = async (): Promise<Order[]> => {
    const ordersData = await fetchCollection<any>('orders');
    
    const orders: Order[] = await Promise.all(ordersData.map(async orderData => {
        const user = await fetchDocumentById<User>('users', orderData.userId);
        const vendor = await fetchDocumentById<Omit<Vendor, 'products'>>('vendors', orderData.vendorId);
        
        const items: OrderItem[] = await Promise.all(
            orderData.items.map(async (item: { productId: string; quantity: number, price: number }) => {
                const product = await fetchDocumentById<Product>('products', item.productId);
                // Important: Use the price from the order item if available, otherwise fallback to product price
                return { 
                    product: { ...product!, price: item.price || product!.price }, 
                    quantity: item.quantity 
                };
            })
        );
        
        return {
            ...orderData,
            user: user!,
            vendor: vendor!,
            items: items,
        } as Order;
    }));
    
    return orders;
}

    