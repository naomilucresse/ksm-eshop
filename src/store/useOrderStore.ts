import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Order {
  id: string;
  customerName: string;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered';
  date: string;
  tenantId: string;
  items: any[];
}

interface OrderState {
  orders: Order[];
  addOrder: (order: Order) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
}

const INITIAL_ORDERS: Order[] = [
  { id: 'KSM-129482', customerName: 'Moussa Ibrahim', total: 4500, status: 'shipped', date: 'Aujourd\'hui, 14:20', tenantId: 't1', items: [] },
  { id: 'KSM-129483', customerName: 'Alice Ngo', total: 12500, status: 'pending', date: 'Aujourd\'hui, 11:05', tenantId: 't1', items: [] },
  { id: 'KSM-129484', customerName: 'Jean Dupont', total: 850, status: 'delivered', date: 'Hier, 18:45', tenantId: 't1', items: [] },
  { id: 'KSM-129485', customerName: 'Céline Atangana', total: 250000, status: 'processing', date: 'Hier, 09:12', tenantId: 't2', items: [] },
];

export const useOrderStore = create<OrderState>()(
  persist(
    (set) => ({
      orders: INITIAL_ORDERS,
      addOrder: (order) => set((state) => ({ 
        orders: [order, ...state.orders] 
      })),
      updateOrderStatus: (orderId, status) => set((state) => ({
        orders: state.orders.map((o) => 
          o.id === orderId ? { ...o, status } : o
        )
      })),
    }),
    {
      name: 'ksm-order-storage',
    }
  )
);
