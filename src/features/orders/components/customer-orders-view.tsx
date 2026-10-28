'use client';

import React from 'react';
import Link from 'next/link';
import { useOrders } from '../hooks/use-orders';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Typography } from '@/components/shared/typography';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { useTranslations } from '@/hooks/use-translations';
import {
  Package,
  Calendar,
  Eye,
  ShieldAlert,
  Loader2,
  ArrowRight,
} from 'lucide-react';

export const CustomerOrdersView: React.FC = () => {
  const { user } = useAuth();
  const { orders, isLoading } = useOrders();
  const tOrders = useTranslations('Orders');
  const tCommon = useTranslations('Common');

  const statusVariantMap: Record<string, 'default' | 'brand' | 'success' | 'warning' | 'destructive'> = {
    PENDING: 'warning',
    PROCESSING: 'brand',
    SHIPPED: 'brand',
    DELIVERED: 'success',
    CANCELLED: 'destructive',
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <Typography variant="h2" weight="bold" className="mb-2">
            {tOrders('myOrdersTitle')}
          </Typography>
          <Typography variant="body-sm" color="muted">
            {tOrders('myOrdersSubtitle')} ({user?.name})
          </Typography>
        </div>

        {/* Demo trigger to test unauthorized order access (Slide 08) */}
        <Link href="/orders/ord-2001">
          <Button
            variant="outline"
            size="sm"
            className="border-amber-500/40 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
            startIcon={<ShieldAlert className="w-4 h-4" />}
          >
            تجربة فحص الأمان (محاولة فتح طلب زبون آخر)
          </Button>
        </Link>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-text-secondary gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <Typography variant="body-sm">جاري جلب الطلبات الخاصة بك...</Typography>
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-16">
          <Package className="w-12 h-12 text-text-secondary mx-auto mb-3 opacity-60" />
          <Typography variant="h4" weight="bold" className="mb-2">
            لا توجد طلبات سابقة
          </Typography>
          <Typography variant="body-sm" color="muted" className="mb-6">
            لم تقم بإنشاء أي طلبات حتى الآن. يمكنك تصفح المنتجات وطلب ما يعجبك.
          </Typography>
          <Link href="/products">
            <Button variant="brand">تصفح المنتجات</Button>
          </Link>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((order) => {
            const variant = statusVariantMap[order.status] || 'default';
            return (
              <Card
                key={order.id}
                className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 hover:border-primary-500/30 transition-all"
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-base text-text-main">
                      #{order.id}
                    </span>
                    <Badge variant={variant} size="sm">
                      {tOrders(`status${order.status.charAt(0) + order.status.slice(1).toLowerCase()}`) || order.status}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-text-secondary">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(order.createdAt).toLocaleDateString('ar-SA')}</span>
                    </span>
                    <span>•</span>
                    <span>
                      {order.items.length} {tOrders('itemsCount')}
                    </span>
                    <span>•</span>
                    <span className="truncate max-w-[200px]">{order.shippingAddress}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-border">
                  <div className="text-end">
                    <span className="text-xs text-text-secondary block">الإجمالي:</span>
                    <span className="text-base font-bold text-primary-500">
                      {order.totalAmount} {tCommon('currency')}
                    </span>
                  </div>

                  <Link href={`/orders/${order.id}`}>
                    <Button
                      variant="secondary"
                      size="sm"
                      startIcon={<Eye className="w-3.5 h-3.5" />}
                    >
                      {tOrders('trackOrder')}
                    </Button>
                  </Link>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
