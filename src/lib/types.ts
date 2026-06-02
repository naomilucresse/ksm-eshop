export type Tenant = {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description: string;
  themeColor: string;
};

export type Category = {
  id: string;
  name: string;
  slug: string;
};

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  categoryId: string;
  tenantId: string;
  stock: number;
  isFeatured?: boolean;
};

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export type OrderItem = {
  productId: string;
  quantity: number;
  price: number;
};

export type Order = {
  id: string;
  tenantId: string;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  createdAt: string;
  paymentMethod: 'epay' | 'mobile_money' | 'card';
};
