'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../apis/orders-api';
import { CreateOrderDto, OrderStatus, UpdateOrderStatusDto } from '../types';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { toast } from 'sonner';

export function useOrders(userOverride?: any) {
  const { user: authUser } = useAuth();
  const user = userOverride !== undefined ? userOverride : authUser;
  const queryClient = useQueryClient();

  const ordersQuery = useQuery({
    queryKey: ['orders', user?.id, user?.role],
    queryFn: () => ordersApi.getOrders(user),
    enabled: !!user,
  });

  const createOrderMutation = useMutation({
    mutationFn: (dto: CreateOrderDto) =>
      ordersApi.createOrder(dto, user?.name || 'الزبون'),
    onSuccess: (order) => {
      toast.success(`تم إنشاء الطلب #${order.id} بنجاح وحجز المخزون`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || err.message || 'فشل إنشاء الطلب';
      toast.error(msg);
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (dto: UpdateOrderStatusDto) =>
      ordersApi.updateStatus(dto, user),
    onSuccess: (order) => {
      toast.success(`تم تحديث حالة الطلب #${order.id} إلى: ${order.status}`);
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'فشل تحديث حالة الطلب';
      toast.error(msg);
    },
  });

  return {
    orders: ordersQuery.data || [],
    isLoading: ordersQuery.isLoading,
    isError: ordersQuery.isError,
    createOrder: createOrderMutation.mutateAsync,
    isCreating: createOrderMutation.isPending,
    updateStatus: updateStatusMutation.mutateAsync,
    isUpdatingStatus: updateStatusMutation.isPending,
    refetch: ordersQuery.refetch,
  };
}

export function useOrderDetail(orderId: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['order', orderId, user?.id],
    queryFn: () => ordersApi.getOrderById(orderId, user),
    enabled: !!orderId && !!user,
    retry: false,
  });
}
