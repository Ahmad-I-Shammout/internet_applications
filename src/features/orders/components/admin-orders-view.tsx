'use client';

import React, { useState } from 'react';
import { useOrders } from '../hooks/use-orders';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { Order, OrderStatus } from '../types';
import { Typography } from '@/components/shared/typography';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { Card } from '@/components/shared/card';
import { Modal } from '@/components/shared/modal';
import { ForbiddenState } from '@/components/shared/forbidden-state';
import { useTranslations } from '@/hooks/use-translations';
import { Shield, Edit3, Eye, Loader2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export const AdminOrdersView: React.FC = () => {
  const { isAdmin, isReady } = useAuth();
  const { orders, isLoading, updateStatus, isUpdatingStatus } = useOrders();
  const tOrders = useTranslations('Orders');
  const tCommon = useTranslations('Common');

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PROCESSING');

  if (isReady && !isAdmin) {
    return (
      <ForbiddenState
        title="غير مصرح (403 Forbidden)"
        description="المتطلب الأول (Slide 07 & 08): إدارة حالات الطلبات وتحديثها هي صلاحية محصورة بالمسؤول (Admin) فقط. تم حظر هذا الإجراء للزبون."
        backHref="/orders"
        backLabel="العودة إلى طلباتي"
      />
    );
  }

  const handleOpenStatusModal = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
  };

  const handleSaveStatus = async () => {
    if (!selectedOrder) return;
    try {
      await updateStatus({
        orderId: selectedOrder.id,
        status: newStatus,
      });
      setSelectedOrder(null);
    } catch {
      // Toast handles error in hook
    }
  };

  const statusOptions: Array<{ value: OrderStatus; label: string }> = [
    { value: 'PENDING', label: tOrders('statusPending') },
    { value: 'PROCESSING', label: tOrders('statusProcessing') },
    { value: 'SHIPPED', label: tOrders('statusShipped') },
    { value: 'DELIVERED', label: tOrders('statusDelivered') },
    { value: 'CANCELLED', label: tOrders('statusCancelled') },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Typography variant="h2" weight="bold">
              {tOrders('adminOrdersTitle')}
            </Typography>
            <Badge variant="brand" size="sm">
              <Shield className="w-3.5 h-3.5" />
              <span>لوحة المسؤول</span>
            </Badge>
          </div>
          <Typography variant="body-sm" color="muted">
            {tOrders('adminOrdersSubtitle')}
          </Typography>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-text-secondary gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <Typography variant="body-sm">جاري تحميل كافة طلبات النظام...</Typography>
        </div>
      ) : orders.length === 0 ? (
        <Card className="text-center py-16">
          <Typography variant="h4" weight="bold" className="mb-2">
            لا توجد طلبات في النظام حالياً
          </Typography>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden border border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs">
              <thead className="bg-surface-2 border-b border-border text-text-secondary font-semibold">
                <tr>
                  <th className="p-4 text-start">{tOrders('orderId')}</th>
                  <th className="p-4 text-start">{tOrders('customerName')}</th>
                  <th className="p-4 text-start">{tOrders('orderDate')}</th>
                  <th className="p-4 text-start">{tOrders('orderStatus')}</th>
                  <th className="p-4 text-start">{tOrders('orderTotal')}</th>
                  <th className="p-4 text-center">{tCommon('actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-surface-2/50 transition-colors"
                  >
                    <td className="p-4 font-mono font-bold text-text-main">
                      #{order.id}
                    </td>
                    <td className="p-4 font-medium text-text-main">
                      {order.customerName}
                    </td>
                    <td className="p-4 text-text-secondary">
                      {new Date(order.createdAt).toLocaleDateString('ar-SA')}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          order.status === 'DELIVERED'
                            ? 'success'
                            : order.status === 'CANCELLED'
                            ? 'destructive'
                            : 'brand'
                        }
                        size="sm"
                      >
                        {tOrders(
                          `status${
                            order.status.charAt(0) +
                            order.status.slice(1).toLowerCase()
                          }`
                        ) || order.status}
                      </Badge>
                    </td>
                    <td className="p-4 font-bold text-primary-500">
                      {order.totalAmount} {tCommon('currency')}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Link href={`/orders/${order.id}`}>
                          <button
                            className="p-1.5 rounded-lg text-text-secondary hover:text-text-main hover:bg-surface-2 transition-colors cursor-pointer"
                            title="عرض تفاصيل الطلب"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>

                        <button
                          onClick={() => handleOpenStatusModal(order)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary-500/10 text-primary-500 hover:bg-primary-500/20 text-xs font-semibold cursor-pointer transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span>تعديل الحالة</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Status Modal */}
      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`تعديل حالة الطلب #${selectedOrder?.id}`}
        description="المتطلب الأول (Slide 07): المسؤول وحده يملك صلاحية تغيير حالة الطلب"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-text-secondary">
              اختر الحالة الجديدة:
            </label>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setNewStatus(opt.value)}
                  className={`flex items-center justify-between p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                    newStatus === opt.value
                      ? 'border-primary-500 bg-primary-500/10 text-primary-500 shadow-xs'
                      : 'border-border bg-surface hover:bg-surface-2 text-text-secondary'
                  }`}
                >
                  <span>{opt.label}</span>
                  <span className="font-mono text-[10px] opacity-60">
                    {opt.value}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border flex items-center justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSelectedOrder(null)}
            >
              {tCommon('cancel')}
            </Button>
            <Button
              variant="brand"
              size="sm"
              isLoading={isUpdatingStatus}
              onClick={handleSaveStatus}
            >
              {tCommon('save')}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
