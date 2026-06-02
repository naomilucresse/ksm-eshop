import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '../lib/types';
import { PRODUCTS as INITIAL_PRODUCTS } from '../lib/mock-data';

interface ProductState {
  products: Product[];
  addProduct: (product: Product) => void;
  updateProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set) => ({
      products: INITIAL_PRODUCTS,
      addProduct: (product) => set((state) => ({ 
        products: [product, ...state.products] 
      })),
      updateProduct: (updatedProduct) => set((state) => ({
        products: state.products.map((p) => 
          p.id === updatedProduct.id ? updatedProduct : p
        )
      })),
      deleteProduct: (productId) => set((state) => ({
        products: state.products.filter((p) => p.id !== productId)
      })),
    }),
    {
      name: 'ksm-product-storage',
    }
  )
);
