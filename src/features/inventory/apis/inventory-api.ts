import api from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import {
  ReleaseStockRequest,
  ReserveStockRequest,
  ReserveStockResponse,
  WarehouseStockCheckResponse,
} from '../types';
import { getStoredProducts, saveStoredProducts } from '@/features/products/apis/mock-data';

export const inventoryApi = {
  /**
   * 1. معرفة الكمية (Get Quantity / Stock Check)
   * Contract operation #1
   */
  async getQuantity(productId: string): Promise<WarehouseStockCheckResponse> {
    if (API_CONFIG.useMock) {
      // Simulate warehouse timeout/down if configured
      if (!API_CONFIG.isWarehouseOnline) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const err: any = new Error('Warehouse Service Timeout / Unavailable');
        err.response = {
          status: 503,
          data: {
            message: 'خدمة المستودع (gRPC) متوقفة أو بطيئة الاستجابة. تعذر جلب المخزون.',
            code: 503,
          },
        };
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));
      const products = getStoredProducts();
      const product = products.find((p) => p.id === productId);

      const count = product ? product.stock : 0;
      return {
        productId,
        availableQuantity: count,
        isAvailable: count > 0,
        warehouseStatus: 'HEALTHY',
      };
    }

    const { data } = await api.get(`/inventory/stock/${productId}`);
    return data;
  },

  /**
   * 2. حجز الكمية (Reserve Quantity)
   * Contract operation #2
   */
  async reserveQuantity(req: ReserveStockRequest): Promise<ReserveStockResponse> {
    if (API_CONFIG.useMock) {
      // Check if warehouse is down
      if (!API_CONFIG.isWarehouseOnline) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const err: any = new Error('Warehouse Service Offline');
        err.response = {
          status: 503,
          data: {
            message: 'خدمة المستودع غير متاحة حالياً لإتمام حجز الكمية.',
            code: 503,
          },
        };
        throw err;
      }

      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));
      const products = getStoredProducts();
      const productIndex = products.findIndex((p) => p.id === req.productId);

      if (productIndex === -1) {
        throw new Error('المنتج غير موجود');
      }

      const current = products[productIndex];

      // Check if stock is sufficient (Slide 12: الكمية غير كافية)
      if (current.stock < req.quantity) {
        const err: any = new Error('Insufficient Stock');
        err.response = {
          status: 400,
          data: {
            message: `نعتذر، الكمية غير كافية في المستودع. المتبقي: ${current.stock} فقط.`,
            code: 400,
          },
        };
        throw err;
      }

      // Reserve stock (decrement)
      current.stock -= req.quantity;
      saveStoredProducts([...products]);

      return {
        success: true,
        reservedQuantity: req.quantity,
        remainingStock: current.stock,
        message: 'تم حجز الكمية بنجاح عبر خدمة المستودع',
      };
    }

    const { data } = await api.post('/inventory/reserve', req);
    return data;
  },

  /**
   * 3. إرجاع الكمية (Release Quantity)
   * Contract operation #3 (Compensating transaction / Rollback)
   */
  async releaseQuantity(req: ReleaseStockRequest): Promise<void> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const products = getStoredProducts();
      const productIndex = products.findIndex((p) => p.id === req.productId);

      if (productIndex !== -1) {
        products[productIndex].stock += req.quantity;
        saveStoredProducts([...products]);
      }
      return;
    }

    await api.post('/inventory/release', req);
  },
};
