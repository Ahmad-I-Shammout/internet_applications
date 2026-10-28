'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useOrderDetail } from '../hooks/use-orders';
import { OrderStepper } from './order-stepper';
import { Typography } from '@/components/shared/typography';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { Badge } from '@/components/shared/badge';
import { ForbiddenState } from '@/components/shared/forbidden-state';
import { useTranslations } from '@/hooks/use-translations';
import { ArrowRight, MapPin, Calendar, User, Loader2 } from 'lucide-react';

export interface OrderDetailViewProps {
  orderId: string;
}

export const OrderDetailView: React.FC<OrderDetailViewProps> = ({ orderId }) => {
  const { data: order, isLoading, isError, error } = useOrderDetail(orderId);
  const tOrders = useTranslations('Orders');
  const tCommon = useTranslations('Common');

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center text-text-secondary gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <Typography variant="body-sm">جاري جلب تفاصيل الطلب وحالته...</Typography>
      </div>
    );
  }

  // Handle 403 Forbidden (Slide 08 Requirement 1 Proof)
  const isForbidden = (error as any)?.response?.status === 403;
  if (isForbidden) {
    return (
      <ForbiddenState
        title="تم رفض الوصول (HTTP 403 Forbidden)"
        description="المتطلب الأول (Slide 08): مستخدم يحاول الوصول إلى طلب غيره. تم رفض طلبك لأن هذا الطلب يخص عميلاً آخر ولا تملك صلاحية الاطلاع عليه."
        backHref="/orders"
        backLabel="العودة إلى طلباتي"
      />
    );
  }

  if (isError || !order) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-surface border border-border rounded-2xl p-8">
        <Typography variant="h4" weight="bold" className="mb-2">
          الطلب غير موجود
        </Typography>
        <Link href="/orders">
          <Button variant="brand" className="mt-4">
            العودة للطلبات
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/orders"
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-main mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>الرجوع إلى قائمة الطلبات</span>
      </Link>

      {/* Header Info */}
      <Card className="p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Typography variant="h3" weight="bold">
                طلب #{order.id}
              </Typography>
              <Badge variant="brand" size="sm">
                المتطلب الأول: متابعة الطلب
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-xs text-text-secondary">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                <span>{new Date(order.createdAt).toLocaleString('ar-SA')}</span>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                <span>الزبون: {order.customerName}</span>
              </span>
            </div>
          </div>

          <div className="text-start sm:text-end">
            <span className="text-xs text-text-secondary block">إجمالي القيمة:</span>
            <span className="text-2xl font-black text-primary-500">
              {order.totalAmount} {tCommon('currency')}
            </span>
          </div>
        </div>

        {/* Status Stepper */}
        <div className="pt-6">
          <Typography variant="h6" weight="bold" className="mb-4">
            حالة الطلب اللحظية
          </Typography>
          <OrderStepper status={order.status} />
        </div>
      </Card>

      {/* Shipping Address & Order Items */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Items */}
        <div className="md:col-span-2">
          <Card className="p-6">
            <Typography variant="h5" weight="bold" className="mb-4">
              العناصر المطلوبة ({order.items.length})
            </Typography>

            <div className="flex flex-col divide-y divide-border">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 py-3 first:pt-0 last:pb-0">
                  {item.imageUrl && (
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden bg-surface-2 shrink-0 border border-border">
                      <Image
                        src={item.imageUrl}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h5 className="text-sm font-bold text-text-main truncate">
                      {item.productName}
                    </h5>
                    <span className="text-xs text-text-secondary">
                      الكمية: {item.quantity} × {item.price} {tCommon('currency')}
                    </span>
                  </div>
                  <span className="text-sm font-bold text-primary-500">
                    {item.price * item.quantity} {tCommon('currency')}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Shipping details */}
        <div className="md:col-span-1">
          <Card className="p-6">
            <Typography variant="h5" weight="bold" className="mb-3">
              تفاصيل الشحن
            </Typography>

            <div className="flex items-start gap-2.5 text-xs text-text-secondary leading-relaxed">
              <MapPin className="w-4 h-4 shrink-0 text-primary-500 mt-0.5" />
              <span>{order.shippingAddress}</span>
            </div>

            <div className="mt-6 pt-4 border-t border-border text-[11px] text-text-secondary leading-normal">
              🔒 <span className="font-semibold text-text-main">أمان الجلسة:</span> يتم التحقق من رقم الزبون المسجل بالـ JWT مع صاحب الطلب في كل استدعاء.
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
