'use client';

import React from 'react';
import { useAuth } from '../hooks/use-auth';
import { Badge } from '@/components/shared/badge';
import { ShieldCheck, UserCheck, AlertTriangle } from 'lucide-react';
import { API_CONFIG } from '@/lib/api-config';

export const UserSwitcherBar: React.FC = () => {
  const { user, availableUsers, switchUser } = useAuth();
  const [warehouseOnline, setWarehouseOnline] = React.useState(API_CONFIG.isWarehouseOnline);

  const toggleWarehouse = () => {
    const next = !warehouseOnline;
    API_CONFIG.setWarehouseOnline(next);
    setWarehouseOnline(next);
  };

  return (
    <aside
      aria-label="شريط اختبار المتطلبات والمقابلة"
      className="bg-surface-2/80 backdrop-blur-md border-b border-border py-2 px-4 text-xs select-none"
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Badge variant="brand" size="sm">
            أداة تجربة المقابلة
          </Badge>
          <span className="text-text-secondary">تبديل الحساب لاختبار الصلاحيات (Slide 07 & 08):</span>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {availableUsers.map((u) => {
            const isSelected = user?.id === u.id;
            return (
              <button
                key={u.id}
                onClick={() => switchUser(u)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-500 text-white shadow-xs'
                    : 'bg-surface text-text-secondary hover:text-text-main border border-border'
                }`}
              >
                {u.role === 'ADMIN' ? (
                  <ShieldCheck className="w-3.5 h-3.5" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5" />
                )}
                <span>{u.name}</span>
                <span className="opacity-70 text-[10px]">({u.role === 'ADMIN' ? 'مسؤول' : 'زبون'})</span>
              </button>
            );
          })}

          <div className="h-4 w-px bg-border mx-1" />

          {/* Warehouse health simulator for Requirement 2 */}
          <button
            onClick={toggleWarehouse}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              warehouseOnline
                ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-red-500/10 text-red-600 border border-red-500/30 hover:bg-red-500/20 animate-pulse'
            }`}
            title="تبديل حالة خدمة المستودع لاختبار Slide 12 & 13"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>المستودع (gRPC): {warehouseOnline ? 'متصل' : 'متوقف / معطل'}</span>
          </button>
        </div>
      </div>
    </aside>
  );
};
