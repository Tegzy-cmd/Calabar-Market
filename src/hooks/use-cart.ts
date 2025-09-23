
'use client';

import { Product } from '@/lib/types';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

export type CartItem = Product & {
  quantity: number;
};

type CartState = {
  items: CartItem[];
  total: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      total: 0,
      addToCart: (product: Product) => {
        const currentItems = get().items;
        const existingItem = currentItems.find((item) => item.id === product.id);

        let updatedItems;
        if (existingItem) {
          updatedItems = currentItems.map((item) =>
            item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
          );
        } else {
          updatedItems = [...currentItems, { ...product, quantity: 1 }];
        }

        const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        set({ items: updatedItems, total: newTotal });
      },
      removeFromCart: (productId: string) => {
        const updatedItems = get().items.filter((item) => item.id !== productId);
        const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        set({ items: updatedItems, total: newTotal });
      },
      updateQuantity: (productId: string, quantity: number) => {
        if (quantity < 1) {
            get().removeFromCart(productId);
            return;
        }

        const updatedItems = get().items.map((item) =>
          item.id === productId ? { ...item, quantity } : item
        );

        const newTotal = updatedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        set({ items: updatedItems, total: newTotal });
      },
      clearCart: () => set({ items: [], total: 0 }),
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
