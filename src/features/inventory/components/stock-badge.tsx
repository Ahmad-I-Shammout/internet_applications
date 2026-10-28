import React from 'react';
import { Badge } from '@/components/shared/badge';
import { CheckCircle2, AlertTriangle, XCircle, CloudOff } from 'lucide-react';

export interface StockBadgeProps {
  stock: number;
  isWarehouseOffline?: boolean;
  className?: string;
}

export const StockBadge: React.FC<StockBadgeProps> = ({
  stock,
  isWarehouseOffline = false,
  className,
}) => {
  if (isWarehouseOffline) {
    return (
      <Badge variant="destructive" size="sm" className={className}>
        <CloudOff className="w-3.5 h-3.5" />
        <span>المستودع غير متصل</span>
      </Badge>
    );
  }

  if (stock <= 0) {
    return (
      <Badge variant="destructive" size="sm" className={className}>
        <XCircle className="w-3.5 h-3.5" />
        <span>نفد المخزون</span>
      </Badge>
    );
  }

  if (stock <= 2) {
    return (
      <Badge variant="warning" size="sm" className={className}>
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>كمية محدودة ({stock} فقط)</span>
      </Badge>
    );
  }

  return (
    <Badge variant="success" size="sm" className={className}>
      <CheckCircle2 className="w-3.5 h-3.5" />
      <span>متوفر بالمستودع ({stock})</span>
    </Badge>
  );
};
