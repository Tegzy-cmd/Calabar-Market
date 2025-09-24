export type User = {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'vendor' | 'admin' | 'rider';
  avatarUrl: string;
  phoneNumber?: string;
  addresses?: string[];
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
  logoUrl: string;
  bannerUrl: string;
  products: Product[];
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
  rider?: Rider;
  subtotal: number;
  deliveryFee: number;
  total: number;
};

export type RiderStatus = 'available' | 'unavailable' | 'on-delivery';

export type Rider = {
  id: string;
  name: string;
  avatarUrl: string;
  vehicle: string;
  location: string;
  status: RiderStatus;
};
