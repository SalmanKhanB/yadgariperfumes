import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { trackMetaAddToCart } from '@/lib/analytics/metaPixel';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
  slug: string;
  selected?: boolean;
  selectedVariant?: {
    name: string;
    price: number;
    sku?: string;
  };
}

interface AppState {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  removeFromCart: (productId: string, variantName?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantName?: string) => void;
  toggleItemSelection: (productId: string, variantName?: string) => void;
  selectAllItems: (selected: boolean) => void;
  removeSelectedFromCart: () => void;
  clearCart: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      cart: [],
      
      addToCart: (item) => {
        const safeQty = Math.min(99, Math.max(1, parseInt(String(item.quantity || 1), 10) || 1));
        const safePrice = Number(item.selectedVariant ? item.selectedVariant.price : item.price) || 0;

        trackMetaAddToCart({
          productId: item.productId,
          name: item.name,
          price: safePrice,
          quantity: safeQty,
        });

        set((state) => {
          const existingItem = state.cart.find((i) => 
            i.productId === item.productId && 
            i.selectedVariant?.name === item.selectedVariant?.name
          );
          if (existingItem) {
            const currentQty = parseInt(String(existingItem.quantity || 1), 10) || 1;
            const newQty = Math.min(99, currentQty + safeQty);
            return {
              cart: state.cart.map((i) =>
                i.productId === item.productId && i.selectedVariant?.name === item.selectedVariant?.name
                  ? { ...i, quantity: newQty, price: safePrice, selected: true }
                  : i
              ),
            };
          }
          return { cart: [...state.cart, { ...item, quantity: safeQty, price: safePrice, selected: true }] };
        });
      },

      removeFromCart: (productId, variantName) => set((state) => ({
        cart: state.cart.filter((i) => 
          !(i.productId === productId && i.selectedVariant?.name === variantName)
        ),
      })),

      updateQuantity: (productId, quantity, variantName) => set((state) => ({
        cart: state.cart.map((i) =>
          i.productId === productId && i.selectedVariant?.name === variantName
            ? { ...i, quantity: Math.min(99, Math.max(1, parseInt(String(quantity), 10) || 1)) }
            : i
        ),
      })),

      toggleItemSelection: (productId, variantName) => set((state) => ({
        cart: state.cart.map((i) =>
          i.productId === productId && i.selectedVariant?.name === variantName
            ? { ...i, selected: i.selected === false ? true : false }
            : i
        ),
      })),

      selectAllItems: (selected) => set((state) => ({
        cart: state.cart.map((i) => ({ ...i, selected })),
      })),

      removeSelectedFromCart: () => set((state) => ({
        cart: state.cart.filter((i) => i.selected === false),
      })),

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: 'sqodex-cart-storage',
      onRehydrateStorage: () => (state) => {
        if (state && Array.isArray(state.cart)) {
          state.cart = state.cart.map((item) => ({
            ...item,
            quantity: Math.min(99, Math.max(1, parseInt(String(item.quantity), 10) || 1)),
            price: Number(item.price) || 0,
            selected: item.selected !== false
          }));
        }
      }
    }
  )
);

