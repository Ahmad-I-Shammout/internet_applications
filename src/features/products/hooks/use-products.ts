'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productsApi } from '../apis/products-api';
import { CreateProductDto, ProductFilterParams } from '../types';
import { toast } from 'sonner';

export function useProducts(params: ProductFilterParams = {}) {
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
  });

  const createProductMutation = useMutation({
    mutationFn: (dto: CreateProductDto) => productsApi.createProduct(dto),
    onSuccess: (newProd) => {
      toast.success(`تمت إضافة المنتج "${newProd.name}" بنجاح`);
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: () => {
      toast.error('فشل في إضافة المنتج، يرجى المحاولة مرة أخرى');
    },
  });

  return {
    products: productsQuery.data?.data || [],
    pagination: {
      page: productsQuery.data?.page || 1,
      limit: productsQuery.data?.limit || 6,
      total: productsQuery.data?.total || 0,
      totalPages: productsQuery.data?.totalPages || 1,
    },
    isLoading: productsQuery.isLoading,
    isError: productsQuery.isError,
    refetch: productsQuery.refetch,
    createProduct: createProductMutation.mutateAsync,
    isCreating: createProductMutation.isPending,
  };
}

export function useProductDetail(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id),
    enabled: !!id,
  });
}
