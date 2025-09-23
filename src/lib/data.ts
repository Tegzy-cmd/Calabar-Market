import type { User, Vendor, Product, Order, Rider } from './types';
import { placeholderImages } from './placeholder-images';

const findImage = (id: string) => placeholderImages.find(p => p.id === id)?.imageUrl || '';

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

const products: Product[] = [
  { id: 'prod-1', vendorId: 'vendor-1', name: 'Classic Burger', description: 'A delicious classic beef burger.', price: 8.99, stock: 100, imageUrl: findImage('product-burger') },
  { id: 'prod-2', vendorId: 'vendor-1', name: 'Cheese Burger', description: 'Classic burger with a slice of cheddar.', price: 9.99, stock: 80, imageUrl: findImage('product-burger') },
  { id: 'prod-3', vendorId: 'vendor-2', name: 'Pepperoni Pizza', description: 'Classic pizza with pepperoni.', price: 12.99, stock: 50, imageUrl: findImage('product-pizza') },
  { id: 'prod-4', vendorId: 'vendor-2', name: 'Margherita Pizza', description: 'Simple and delicious tomato and cheese pizza.', price: 10.99, stock: 60, imageUrl: findImage('product-pizza') },
  { id: 'prod-5', vendorId: 'vendor-3', name: 'Fresh Apples', description: 'A bag of crisp red apples.', price: 4.99, stock: 200, imageUrl: findImage('product-apples') },
  { id: 'prod-6', vendorId: 'vendor-3', name: 'Sourdough Bread', description: 'A loaf of freshly baked sourdough bread.', price: 5.49, stock: 40, imageUrl: findImage('product-bread') },
];

export const vendors: Vendor[] = [
  {
    id: 'vendor-1',
    name: 'Burger Queen',
    description: 'The best burgers in town.',
    category: 'food',
    logoUrl: findImage('vendor-logo-1'),
    bannerUrl: findImage('vendor-banner-1'),
    products: products.filter(p => p.vendorId === 'vendor-1'),
  },
  {
    id: 'vendor-2',
    name: 'Pizza Palace',
    description: 'Authentic Italian pizza.',
    category: 'food',
    logoUrl: findImage('vendor-logo-2'),
    bannerUrl: findImage('vendor-banner-2'),
    products: products.filter(p => p.vendorId === 'vendor-2'),
  },
  {
    id: 'vendor-3',
    name: 'Green Grocer',
    description: 'Fresh and organic groceries.',
    category: 'groceries',
    logoUrl: findImage('vendor-logo-3'),
    bannerUrl: findImage('vendor-banner-3'),
    products: products.filter(p => p.vendorId === 'vendor-3'),
  },
];

export const orders: Order[] = [
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
];

// Helper functions to get data
export const getVendors = (category?: 'food' | 'groceries') => {
  if (category) {
    return vendors.filter(v => v.category === category);
  }
  return vendors;
};

export const getVendorById = (id: string) => vendors.find(v => v.id === id);
export const getOrderById = (id: string) => orders.find(o => o.id === id);
export const getProductById = (id: string) => products.find(p => p.id === id);
export const getRiders = () => riders;
export const getUsers = () => users;
