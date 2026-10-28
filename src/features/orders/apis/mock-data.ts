import { Order } from '../types';

export const initialMockOrders: Order[] = [
  {
    id: 'ord-1001',
    customerId: 'user-customer-1',
    customerName: 'أحمد التاجر (زبون 1)',
    status: 'SHIPPED',
    totalAmount: 1250,
    shippingAddress: 'الرياض - حي الملز، شارع الجامعة',
    createdAt: '2026-10-27T14:30:00Z',
    items: [
      {
        productId: 'prod-5',
        productName: 'ماكينة تحضير الإسبريسو المنزلية',
        price: 1250,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200&q=80',
      },
    ],
  },
  {
    id: 'ord-1002',
    customerId: 'user-customer-1',
    customerName: 'أحمد التاجر (زبون 1)',
    status: 'PROCESSING',
    totalAmount: 499,
    shippingAddress: 'الرياض - حي النخيل',
    createdAt: '2026-10-28T11:00:00Z',
    items: [
      {
        productId: 'prod-2',
        productName: 'ساعة يد ذكية مقاومة للماء',
        price: 499,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200&q=80',
      },
    ],
  },
  {
    id: 'ord-2001',
    customerId: 'user-customer-2', // Belonging to Customer 2!
    customerName: 'سارة الزبونة (زبون 2)',
    status: 'PENDING',
    totalAmount: 320,
    shippingAddress: 'جدة - حي الروضة',
    createdAt: '2026-10-28T15:20:00Z',
    items: [
      {
        productId: 'prod-4',
        productName: 'حذاء رياضي خفيف الوزن للركض',
        price: 320,
        quantity: 1,
        imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&q=80',
      },
    ],
  },
];

export function getStoredOrders(): Order[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('mock_orders_list');
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // Fallback
      }
    }
  }
  return initialMockOrders;
}

export function saveStoredOrders(orders: Order[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_orders_list', JSON.stringify(orders));
  }
}
