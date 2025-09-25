
import type { User, Vendor, Product, Order, Dispatcher, OrderItem, OrderStatus } from './types';
import { db } from './firebase';
import { collection, getDocs, getDoc, doc, query, where, Timestamp } from 'firebase/firestore';

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
    
    if (!user || !vendor) return null; // or handle error appropriately

    const items: OrderItem[] = await Promise.all(
        orderData.items.map(async (item: { productId: string; quantity: number }) => {
            const product = await fetchDocumentById<Product>('products', item.productId);
            return { product: product!, quantity: item.quantity };
        })
    );
    
    const dispatcher = orderData.dispatcherId ? await fetchDocumentById<Dispatcher>('dispatchers', orderData.dispatcherId) : undefined;
    
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

export const processOrderDoc = async (orderDoc: any): Promise<Order> => {
    const orderData = processDoc(orderDoc);
    const user = await fetchDocumentById<User>('users', orderData.userId);
    const vendor = await fetchDocumentById<Omit<Vendor, 'products'>>('vendors', orderData.vendorId);
    
    const items: OrderItem[] = await Promise.all(
        orderData.items.map(async (item: { productId: string; quantity: number, price: number }) => {
            const product = await fetchDocumentById<Product>('products', item.productId);
            // Ensure product is not null before proceeding
            if (!product) {
                // Handle case where product is not found, maybe skip or log an error
                console.error(`Product with ID ${item.productId} not found for order ${orderData.id}`);
                return null;
            }
            return { 
                product: { ...product, price: item.price || product.price }, 
                quantity: item.quantity 
            };
        })
    );

    // Filter out any null items that resulted from a product not being found
    const validItems = items.filter(item => item !== null) as OrderItem[];
    
    const dispatcher = orderData.dispatcherId ? await fetchDocumentById<Dispatcher>('dispatchers', orderData.dispatcherId) : undefined;
    
    return {
        ...orderData,
        user: user!,
        vendor: vendor!,
        dispatcher,
        items: validItems,
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
