import api from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import { CreateOrderDto, Order, OrderStatus, UpdateOrderStatusDto } from '../types';
import { getStoredOrders, saveStoredOrders } from './mock-data';
import { inventoryApi } from '@/features/inventory/apis/inventory-api';
import { getStoredProducts } from '@/features/products/apis/mock-data';
import { User } from '@/features/auth/types';

export const ordersApi = {
  /**
   * Get Orders based on User Role (Slide 07)
   * Customer sees only their own orders. Admin sees all orders.
   */
  async getOrders(currentUser: User | null): Promise<Order[]> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 50));
      const allOrders = getStoredOrders();

      if (!currentUser) {
        return [];
      }

      if (currentUser.role === 'ADMIN') {
        return allOrders;
      }

      // Customer sees ONLY their own orders (Requirement 1: Slide 07 & Page 1)
      return allOrders.filter((o) => o.customerId === currentUser.id);
    }

    const { data } = await api.get('/orders');
    return data;
  },

  /**
   * Get Order by ID with RBAC Enforcement (Slide 08 Proof)
   */
  async getOrderById(orderId: string, currentUser: User | null): Promise<Order> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));
      const allOrders = getStoredOrders();
      const order = allOrders.find((o) => o.id === orderId);

      if (!order) {
        const err: any = new Error('Order Not Found');
        err.response = { status: 404, data: { message: 'الطلب غير موجود' } };
        throw err;
      }

      // RBAC Enforcement (Slide 08: مستخدم يحاول الوصول لطلب غيره -> 403 Forbidden)
      if (
        currentUser &&
        currentUser.role !== 'ADMIN' &&
        order.customerId !== currentUser.id
      ) {
        const err: any = new Error('Forbidden: Unauthorized Order Access');
        err.response = {
          status: 403,
          data: {
            message: 'المتطلب الأول (403): ليس لديك الصلاحية لعرض تفاصيل هذا الطلب لأنه يخص مستخدماً آخر.',
            code: 403,
          },
        };
        throw err;
      }

      return order;
    }

    const { data } = await api.get(`/orders/${orderId}`);
    return data;
  },

  /**
   * Create Order with Inventory Reservation (Slide 11 & 12)
   */
  async createOrder(dto: CreateOrderDto, customerName: string): Promise<Order> {
    if (API_CONFIG.useMock) {
      const reservedItems: Array<{ productId: string; quantity: number }> = [];

      try {
        // Step 1: Reserve stock in warehouse service (gRPC)
        for (const item of dto.items) {
          await inventoryApi.reserveQuantity({
            productId: item.productId,
            quantity: item.quantity,
          });
          reservedItems.push(item);
        }

        // Step 2: Build Order
        const products = getStoredProducts();
        const orderItems = dto.items.map((it) => {
          const prod = products.find((p) => p.id === it.productId);
          return {
            productId: it.productId,
            productName: prod?.name || 'منتج',
            price: prod?.price || 100,
            quantity: it.quantity,
            imageUrl: prod?.imageUrl,
          };
        });

        const totalAmount = orderItems.reduce(
          (sum, it) => sum + it.price * it.quantity,
          0
        );

        const newOrder: Order = {
          id: `ord-${Date.now().toString().slice(-4)}`,
          customerId: dto.customerId,
          customerName: customerName || 'زبون المتجر',
          items: orderItems,
          totalAmount,
          status: 'PENDING',
          shippingAddress: dto.shippingAddress,
          createdAt: new Date().toISOString(),
        };

        // Step 3: Save order to database
        const orders = getStoredOrders();
        saveStoredOrders([newOrder, ...orders]);

        return newOrder;
      } catch (error: any) {
        // Step 4 (Slide 12): Rollback / Compensating Transaction
        // If anything fails, release all already reserved stock
        for (const res of reservedItems) {
          await inventoryApi.releaseQuantity({
            productId: res.productId,
            quantity: res.quantity,
            reason: 'Order creation failed - Rollback',
          });
        }
        throw error;
      }
    }

    const { data } = await api.post('/orders', dto);
    return data;
  },

  /**
   * Admin-Only: Change Order Status (Slide 07: المسؤول وحده يغيّر حالة الطلب)
   */
  async updateStatus(
    dto: UpdateOrderStatusDto,
    currentUser: User | null
  ): Promise<Order> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));

      // RBAC check (Slide 07 & 08)
      if (!currentUser || currentUser.role !== 'ADMIN') {
        const err: any = new Error('Forbidden: Admin Only');
        err.response = {
          status: 403,
          data: {
            message: 'المتطلب الأول (403): المسؤول وحده يملك صلاحية تغيير حالة الطلب.',
            code: 403,
          },
        };
        throw err;
      }

      const orders = getStoredOrders();
      const index = orders.findIndex((o) => o.id === dto.orderId);

      if (index === -1) {
        throw new Error('الطلب غير موجود');
      }

      orders[index].status = dto.status;
      orders[index].updatedAt = new Date().toISOString();
      saveStoredOrders([...orders]);

      return orders[index];
    }

    const { data } = await api.patch(`/orders/${dto.orderId}/status`, {
      status: dto.status,
    });
    return data;
  },
};
