import { Order, OrderItem } from '../types';

export function mapOrderItemFromDto(raw: any): OrderItem {
  return {
    productId: raw.productId || raw.product_id || '',
    productName: raw.productName || raw.product_name || raw.title || '',
    price: Number(raw.price || 0),
    quantity: Number(raw.quantity || 1),
    imageUrl: raw.imageUrl || raw.image_url,
  };
}

export function mapOrderFromDto(raw: any): Order {
  return {
    id: raw.id || raw.order_id || raw._id || '',
    customerId: raw.customerId || raw.customer_id || '',
    customerName: raw.customerName || raw.customer_name || 'زبون',
    items: (raw.items || []).map(mapOrderItemFromDto),
    totalAmount: Number(raw.totalAmount || raw.total_amount || raw.total || 0),
    status: (raw.status || raw.order_status || 'PENDING').toUpperCase(),
    shippingAddress: raw.shippingAddress || raw.shipping_address || '',
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at,
  };
}
