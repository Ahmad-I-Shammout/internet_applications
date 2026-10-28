'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProductDetail } from '../hooks/use-products';
import { useInventory } from '@/features/inventory/hooks/use-inventory';
import { StockBadge } from '@/features/inventory/components/stock-badge';
import { Typography } from '@/components/shared/typography';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { Card } from '@/components/shared/card';
import { CheckoutModal } from '@/features/orders/components/checkout-modal';
import { useTranslations } from '@/hooks/use-translations';
import { ArrowRight, ShoppingCart, RefreshCw, Loader2, ShieldCheck } from 'lucide-react';
import { API_CONFIG } from '@/lib/api-config';

export interface ProductDetailViewProps {
  productId: string;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({ productId }) => {
  const router = useRouter();
  const tProd = useTranslations('Products');
  const tCommon = useTranslations('Common');

  const { data: product, isLoading, isError } = useProductDetail(productId);
  const { stock, isLoading: isCheckingStock, refetch: refetchStock } = useInventory(productId);

  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const isWarehouseOffline = !API_CONFIG.isWarehouseOnline;

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-20 flex flex-col items-center justify-center text-text-secondary gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
        <Typography variant="body-sm">جاري تحميل تفاصيل المنتج...</Typography>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="max-w-md mx-auto my-16 text-center bg-surface border border-border rounded-2xl p-8">
        <Typography variant="h4" weight="bold" className="mb-2">
          المنتج غير موجود
        </Typography>
        <Link href="/products">
          <Button variant="brand" className="mt-4">
            العودة للمنتجات
          </Button>
        </Link>
      </div>
    );
  }

  // Use the live stock from inventory hook or fallback to product stock
  const currentStock = typeof stock === 'number' ? stock : product.stock;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-main mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>الرجوع إلى قائمة المنتجات</span>
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Product Image */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-surface-2 border border-border shadow-xs">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            priority
            className="object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="default">
                {tProd(product.category) || product.category}
              </Badge>
              <StockBadge stock={currentStock} isWarehouseOffline={isWarehouseOffline} />
            </div>

            <Typography variant="h2" weight="bold" className="mb-3">
              {product.name}
            </Typography>

            <div className="flex items-baseline gap-2 mb-4">
              <span className="text-3xl font-extrabold text-primary-500">
                {product.price}
              </span>
              <span className="text-sm font-semibold text-text-secondary">
                {tCommon('currency')}
              </span>
            </div>
          </div>

          {/* Warehouse gRPC status box (Slide 11 Flow 1) */}
          <Card className="p-4 bg-surface-2/60 border-primary-500/20">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="text-xs font-bold text-text-main flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-primary-500" />
                <span>فحص المخزون المباشر (عقد gRPC):</span>
              </span>
              <button
                onClick={() => refetchStock()}
                className="text-xs text-primary-500 hover:underline flex items-center gap-1 cursor-pointer"
                title="إعادة الاستعلام من المستودع"
              >
                <RefreshCw className={`w-3 h-3 ${isCheckingStock ? 'animate-spin' : ''}`} />
                <span>تحديث حي</span>
              </button>
            </div>
            <Typography variant="caption" color="muted">
              يسأل التطبيق خدمة المستودع مباشرة عن الكمية المتوفرة عبر العقد المشترك قبل السماح بطلب الشراء.
            </Typography>
          </Card>

          {/* Description */}
          <div>
            <Typography variant="h6" weight="semibold" className="mb-2">
              وصف المنتج
            </Typography>
            <Typography variant="body-sm" color="muted" className="leading-relaxed">
              {product.description}
            </Typography>
          </div>

          {/* Action */}
          <div className="pt-4 border-t border-border flex items-center gap-4">
            <Button
              variant="brand"
              size="lg"
              className="flex-1"
              disabled={currentStock <= 0 || isWarehouseOffline}
              onClick={() => setIsBuyModalOpen(true)}
              startIcon={<ShoppingCart className="w-5 h-5" />}
            >
              {currentStock <= 0 ? 'نفد المخزون' : 'طلب المنتج الآن'}
            </Button>
          </div>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        product={{ ...product, stock: currentStock }}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onOrderSuccess={(orderId) => router.push(`/orders/${orderId}`)}
      />
    </div>
  );
};
