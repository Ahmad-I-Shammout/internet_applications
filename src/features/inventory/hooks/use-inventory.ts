'use client';

import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../apis/inventory-api';

export function useInventory(productId: string) {
  const stockQuery = useQuery({
    queryKey: ['inventory', 'stock', productId],
    queryFn: () => inventoryApi.getQuantity(productId),
    enabled: !!productId,
    retry: 1,
    staleTime: 5000,
  });

  return {
    stock: stockQuery.data?.availableQuantity ?? 0,
    isAvailable: (stockQuery.data?.availableQuantity ?? 0) > 0,
    isLoading: stockQuery.isLoading,
    isError: stockQuery.isError,
    error: stockQuery.error,
    refetch: stockQuery.refetch,
  };
}
