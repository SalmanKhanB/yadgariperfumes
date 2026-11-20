import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface ViewedProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice?: number;
  inStock: boolean;
  inventory: number;
  images: any[];
  category?: {
    name: string;
    slug: string;
  };
  categories?: any[];
  viewedAt: number;
}

interface RecentlyViewedState {
  viewedProducts: ViewedProduct[];
  addProduct: (product: any) => void;
  clearHistory: () => void;
}

const MAX_HISTORY = 10;

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set) => ({
      viewedProducts: [],
      
      addProduct: (product) => set((state) => {
        // Remove if already exists to move it to the front
        const filtered = state.viewedProducts.filter(p => p._id !== product._id);
        
        // Minimize image data to prevent QuotaExceededError in localStorage
        const minimalImages = product.images && product.images.length > 0 
          ? [typeof product.images[0] === 'string' ? product.images[0] : { url: product.images[0].url, altText: product.images[0].altText }] 
          : [];

        const newProduct: ViewedProduct = {
          _id: product._id,
          name: product.name,
          slug: product.slug,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          inStock: product.inStock,
          inventory: product.inventory,
          images: minimalImages,
          categories: product.categories,
          viewedAt: Date.now()
        };
        
        const newHistory = [newProduct, ...filtered].slice(0, MAX_HISTORY);
        return { viewedProducts: newHistory };
      }),

      clearHistory: () => set({ viewedProducts: [] }),
    }),
    {
      name: 'sqodex-recently-viewed',
    }
  )
);
