

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin' | 'dispatcher';
  avatarUrl: string;
  phoneNumber?: string;
  addresses?: string[];
  vendorId?: string; // Link to vendor profile
  dispatcherId?: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stock: number;
  vendorId: string;
};

export type Vendor = {
  id:string;
  name: string;
  description: string;
  category: 'food' | 'groceries';
  address: string;
  logoUrl: string;
  bannerUrl: string;
  products: Product[];
  ownerId?: string; // Link to user profile
};

export type OrderItem = {
  product: Product;
  quantity: number;
};

export type OrderStatus = 'placed' | 'preparing' | 'dispatched' | 'delivered' | 'cancelled';

export type Order = {
  id: string;
  user: User;
  vendor: Omit<Vendor, 'products'>;
  items: OrderItem[];
  status: OrderStatus;
  deliveryAddress: string;
  createdAt: string;
  dispatcher?: Dispatcher;
  dispatcherId?: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type DispatcherStatus = 'available' | 'unavailable' | 'on-delivery';

export type DispatcherVehicle = 'bicycle' | 'scooter' | 'motorbike' | 'car' | 'van';

export type Dispatcher = {
  id: string;
  name: string;
  avatarUrl: string;
  vehicle: DispatcherVehicle;
  location: string;
  status: DispatcherStatus;
  completedDispatches: number;
  rating: number;
  phoneNumber?: string;
};

export type ChatMessage = {
    id: string;
    text: string;
    senderId: string;
    senderName: string;
    senderRole: 'user' | 'vendor' | 'dispatcher';
    timestamp: string;
}
