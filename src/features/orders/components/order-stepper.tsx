import React from 'react';
import { OrderStatus } from '../types';
import { CheckCircle2, Clock, Truck, Check, XCircle } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

export interface OrderStepperProps {
  status: OrderStatus;
}

export const OrderStepper: React.FC<OrderStepperProps> = ({ status }) => {
  const tOrders = useTranslations('Orders');

  if (status === 'CANCELLED') {
    return (
      <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-3">
        <XCircle className="w-5 h-5 shrink-0" />
        <div>
          <span className="font-bold text-sm block">{tOrders('statusCancelled')}</span>
          <span className="text-xs">تم إلغاء هذا الطلب وإرجاع الكمية المحجوزة للمستودع.</span>
        </div>
      </div>
    );
  }

  const steps = [
    { key: 'PENDING', label: tOrders('statusPending'), icon: <Clock className="w-4 h-4" /> },
    { key: 'PROCESSING', label: tOrders('statusProcessing'), icon: <CheckCircle2 className="w-4 h-4" /> },
    { key: 'SHIPPED', label: tOrders('statusShipped'), icon: <Truck className="w-4 h-4" /> },
    { key: 'DELIVERED', label: tOrders('statusDelivered'), icon: <Check className="w-4 h-4" /> },
  ];

  const statusOrder: Record<OrderStatus, number> = {
    PENDING: 0,
    PROCESSING: 1,
    SHIPPED: 2,
    DELIVERED: 3,
    CANCELLED: -1,
  };

  const currentIdx = statusOrder[status] ?? 0;

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Background track line */}
        <div className="absolute top-1/2 -translate-y-1/2 start-6 end-6 h-1 bg-surface-2 -z-0" />

        {/* Completed track line */}
        <div
          className="absolute top-1/2 -translate-y-1/2 start-6 h-1 bg-primary-500 transition-all duration-500 -z-0"
          style={{
            width: `${(currentIdx / (steps.length - 1)) * 100}%`,
          }}
        />

        {steps.map((s, idx) => {
          const isDone = idx <= currentIdx;
          const isCurrent = idx === currentIdx;

          return (
            <div key={s.key} className="flex flex-col items-center gap-2 z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'bg-primary-500 text-white shadow-md'
                    : 'bg-surface-2 text-text-secondary border border-border'
                } ${isCurrent ? 'ring-4 ring-primary-500/20 scale-110' : ''}`}
              >
                {s.icon}
              </div>
              <span
                className={`text-xs font-semibold whitespace-nowrap ${
                  isDone ? 'text-primary-500' : 'text-text-secondary'
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
