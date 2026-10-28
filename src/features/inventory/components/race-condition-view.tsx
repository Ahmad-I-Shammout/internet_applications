'use client';

import React, { useState } from 'react';
import { Card } from '@/components/shared/card';
import { Typography } from '@/components/shared/typography';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { StockBadge } from './stock-badge';
import { WarehouseStatusAlert } from './warehouse-status-alert';
import { ordersApi } from '@/features/orders/apis/orders-api';
import { productsApi } from '@/features/products/apis/products-api';
import { API_CONFIG } from '@/lib/api-config';
import { Zap, ShieldCheck, XCircle, CheckCircle2, RotateCcw, AlertTriangle, User } from 'lucide-react';
import { toast } from 'sonner';

export const RaceConditionView: React.FC = () => {
  const [stock, setStock] = useState<number>(1);
  const [warehouseOnline, setWarehouseOnline] = useState<boolean>(API_CONFIG.isWarehouseOnline);

  const [isSimulating, setIsSimulating] = useState(false);
  const [user1Result, setUser1Result] = useState<{ status: 'IDLE' | 'SUCCESS' | 'FAILED'; message?: string }>({ status: 'IDLE' });
  const [user2Result, setUser2Result] = useState<{ status: 'IDLE' | 'SUCCESS' | 'FAILED'; message?: string }>({ status: 'IDLE' });

  // Sync with API_CONFIG
  React.useEffect(() => {
    return API_CONFIG.subscribe(() => {
      setWarehouseOnline(API_CONFIG.isWarehouseOnline);
    });
  }, []);

  const handleToggleWarehouse = () => {
    const next = !warehouseOnline;
    API_CONFIG.setWarehouseOnline(next);
    setWarehouseOnline(next);
    toast.info(`تم تبديل حالة خدمة المستودع إلى: ${next ? 'متصل (Online)' : 'متوقف (Offline)'}`);
  };

  const handleResetStock = () => {
    setStock(1);
    productsApi.updateStock('prod-race-condition', 1 - stock);
    setUser1Result({ status: 'IDLE' });
    setUser2Result({ status: 'IDLE' });
    toast.success('تمت إعادة ضبط المخزون إلى قطعة واحدة (1) بنجاح');
  };

  const runConcurrentOrders = async () => {
    setIsSimulating(true);
    setUser1Result({ status: 'IDLE' });
    setUser2Result({ status: 'IDLE' });

    // Both users concurrently place an order for the 1 remaining item
    const orderPromiseUser1 = ordersApi.createOrder(
      {
        customerId: 'user-customer-1',
        shippingAddress: 'الرياض - عنوان الزبون الأول',
        items: [{ productId: 'prod-race-condition', quantity: 1 }],
      },
      'أحمد (الزبون الأول)'
    );

    const orderPromiseUser2 = ordersApi.createOrder(
      {
        customerId: 'user-customer-2',
        shippingAddress: 'جدة - عنوان الزبون الثاني',
        items: [{ productId: 'prod-race-condition', quantity: 1 }],
      },
      'سارة (الزبون الثاني)'
    );

    const [res1, res2] = await Promise.allSettled([orderPromiseUser1, orderPromiseUser2]);

    if (res1.status === 'fulfilled') {
      setUser1Result({
        status: 'SUCCESS',
        message: `نجح حجز القطعة وإنشاء الطلب #${res1.value.id}`,
      });
    } else {
      setUser1Result({
        status: 'FAILED',
        message: res1.reason?.response?.data?.message || res1.reason?.message || 'فشل الطلب',
      });
    }

    if (res2.status === 'fulfilled') {
      setUser2Result({
        status: 'SUCCESS',
        message: `نجح حجز القطعة وإنشاء الطلب #${res2.value.id}`,
      });
    } else {
      setUser2Result({
        status: 'FAILED',
        message: res2.reason?.response?.data?.message || res2.reason?.message || 'فشل الطلب',
      });
    }

    // Refresh stock
    try {
      const prod = await productsApi.getProductById('prod-race-condition');
      setStock(prod.stock);
    } catch {
      setStock(0);
    }

    setIsSimulating(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-bold mb-3">
          <Zap className="w-3.5 h-3.5" />
          <span>المتطلب الثاني: إثبات المقابلة (Slides 12 & 13)</span>
        </div>
        <Typography variant="h2" weight="bold" className="mb-2">
          محاكاة سباق الطلبات (Race Condition) وحالات تعطل المستودع
        </Typography>
        <Typography variant="body-sm" color="muted">
          إثبات ما يطلبه مقيّم المشروع: عدة طلبات في نفس اللحظة على آخر قطعة (ينجح طلب واحد فقط)، وماذا يرى المستخدم عند توقف خدمة المستودع.
        </Typography>
      </div>

      {/* Warehouse Status Banner */}
      <WarehouseStatusAlert
        isOffline={!warehouseOnline}
        onRetry={handleToggleWarehouse}
      />

      {/* Control Box */}
      <Card className="p-6 mb-8 border-primary-500/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
          <div>
            <h4 className="font-bold text-base text-text-main flex items-center gap-2">
              <span>المنتج المتنافس عليه:</span>
              <span className="text-primary-500">سماعات احترافية عازلة للضوضاء</span>
            </h4>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-text-secondary">المخزون الحالي بالمستودع:</span>
              <StockBadge stock={stock} isWarehouseOffline={!warehouseOnline} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleWarehouse}
              startIcon={<AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
            >
              {warehouseOnline ? 'محاكاة توقف المستودع (Offline)' : 'تشغيل المستودع (Online)'}
            </Button>

            <Button
              variant="secondary"
              size="sm"
              onClick={handleResetStock}
              startIcon={<RotateCcw className="w-3.5 h-3.5" />}
            >
              إعادة الضبط لقطعة واحدة
            </Button>
          </div>
        </div>

        {/* Action Trigger */}
        <div className="pt-6 text-center">
          <Button
            variant="brand"
            size="lg"
            isLoading={isSimulating}
            onClick={runConcurrentOrders}
            className="w-full sm:w-auto px-8"
            startIcon={<Zap className="w-4 h-4 text-amber-300" />}
          >
            إطلاق طلبين متزامنين على آخر قطعة في نفس اللحظة (Race Simulation)
          </Button>
          <span className="block text-xs text-text-secondary mt-2">
            يتم إرسال الطلبين بشكل متزامن تماماً عبر `Promise.all` للتحقق من قفل الحجز بالعقد المشترك
          </span>
        </div>
      </Card>

      {/* Side-by-Side Results (Slide 13 Proof) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User 1 Result */}
        <Card
          className={`p-6 transition-all border-2 ${
            user1Result.status === 'SUCCESS'
              ? 'border-emerald-500 bg-emerald-500/5'
              : user1Result.status === 'FAILED'
              ? 'border-red-500 bg-red-500/5'
              : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500">
                <User className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-text-main">الزبون الأول (أحمد)</span>
            </div>
            {user1Result.status === 'SUCCESS' && (
              <Badge variant="success">طلب ناجح</Badge>
            )}
            {user1Result.status === 'FAILED' && (
              <Badge variant="destructive">طلب مرفوض</Badge>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface-2 text-xs min-h-[90px] flex items-center justify-center text-center">
            {user1Result.status === 'IDLE' ? (
              <span className="text-text-secondary">في انتظار إطلاق التجربة...</span>
            ) : user1Result.status === 'SUCCESS' ? (
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-6 h-6" />
                <span>{user1Result.message}</span>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400 font-semibold flex flex-col items-center gap-1.5">
                <XCircle className="w-6 h-6" />
                <span>{user1Result.message}</span>
              </div>
            )}
          </div>
        </Card>

        {/* User 2 Result */}
        <Card
          className={`p-6 transition-all border-2 ${
            user2Result.status === 'SUCCESS'
              ? 'border-emerald-500 bg-emerald-500/5'
              : user2Result.status === 'FAILED'
              ? 'border-red-500 bg-red-500/5'
              : 'border-border'
          }`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                <User className="w-4 h-4" />
              </div>
              <span className="font-bold text-sm text-text-main">الزبون الثاني (سارة)</span>
            </div>
            {user2Result.status === 'SUCCESS' && (
              <Badge variant="success">طلب ناجح</Badge>
            )}
            {user2Result.status === 'FAILED' && (
              <Badge variant="destructive">طلب مرفوض</Badge>
            )}
          </div>

          <div className="p-4 rounded-xl bg-surface-2 text-xs min-h-[90px] flex items-center justify-center text-center">
            {user2Result.status === 'IDLE' ? (
              <span className="text-text-secondary">في انتظار إطلاق التجربة...</span>
            ) : user2Result.status === 'SUCCESS' ? (
              <div className="text-emerald-600 dark:text-emerald-400 font-semibold flex flex-col items-center gap-1.5">
                <CheckCircle2 className="w-6 h-6" />
                <span>{user2Result.message}</span>
              </div>
            ) : (
              <div className="text-red-600 dark:text-red-400 font-semibold flex flex-col items-center gap-1.5">
                <XCircle className="w-6 h-6" />
                <span>{user2Result.message}</span>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Explanatory Note for Interview Evaluation */}
      <div className="mt-8 p-4 bg-surface-2 rounded-2xl border border-border text-xs text-text-secondary leading-relaxed">
        <h5 className="font-bold text-text-main mb-1 flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-primary-500" />
          <span>ملخص نتيجة الإثبات للمقابلة:</span>
        </h5>
        عند وجود قطعة واحدة فقط وتلقي طلبين متزامنين، يتعامل عقد الـ gRPC مع الحجز الذري (Atomic Lock) بحيث يُكمل طلباً واحداً بنجاح، ويتم رفض الطلب الثاني برسالة صريحة (الكمية غير كافية)، مع إظهار مهلة الانتظار الواضحة حال تعطل المستودع.
      </div>
    </div>
  );
};
