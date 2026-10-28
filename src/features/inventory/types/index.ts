export interface WarehouseStockCheckResponse {
  productId: string;
  availableQuantity: number;
  isAvailable: boolean;
  warehouseStatus: 'HEALTHY' | 'DEGRADED' | 'DOWN';
}

export interface ReserveStockRequest {
  productId: string;
  quantity: number;
  orderId?: string;
}

export interface ReserveStockResponse {
  success: boolean;
  reservedQuantity: number;
  remainingStock: number;
  message?: string;
}

export interface ReleaseStockRequest {
  productId: string;
  quantity: number;
  reason?: string;
}
