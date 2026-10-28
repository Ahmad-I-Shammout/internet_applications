import React from 'react';
import { AlertTriangle, Clock } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

export interface WarehouseStatusAlertProps {
  isOffline: boolean;
  onRetry?: () => void;
}

export const WarehouseStatusAlert: React.FC<WarehouseStatusAlertProps> = ({
  isOffline,
  onRetry,
}) => {
  const tWarehouse = useTranslations('Warehouse');

  if (!isOffline) return null;

  return (
    <div className="w-full my-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-start justify-between gap-4 animate-in fade-in duration-200">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
        <div>
          <h4 className="text-sm font-bold flex items-center gap-1.5">
            <span>{tWarehouse('statusOffline')}</span>
          </h4>
          <p className="text-xs mt-1 leading-relaxed text-amber-800/80 dark:text-amber-200/80">
            {tWarehouse('timeoutNotice')} - تم رصد مهلة اتصال من خدمة المستودع (gRPC Timeout). تم تجميد الطلبات مؤقتاً لحين استعادة الاتصال لضمان سلامة المخزون.
          </p>
        </div>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold cursor-pointer transition-colors shadow-xs"
        >
          <Clock className="w-3.5 h-3.5" />
          <span>إعادة المحاولة</span>
        </button>
      )}
    </div>
  );
};
