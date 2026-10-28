'use client';

import React, { useState } from 'react';
import { useProducts } from '../hooks/use-products';
import { Product } from '../types';
import { ProductCard } from './product-card';
import { CategoryFilter } from './category-filter';
import { PaginationControl } from './pagination-control';
import { Typography } from '@/components/shared/typography';
import { Input } from '@/components/shared/input';
import { WarehouseStatusAlert } from '@/features/inventory/components/warehouse-status-alert';
import { CheckoutModal } from '@/features/orders/components/checkout-modal';
import { useTranslations } from '@/hooks/use-translations';
import { Search, Loader2 } from 'lucide-react';
import { API_CONFIG } from '@/lib/api-config';
import { useRouter } from 'next/navigation';

export const ProductsListView: React.FC = () => {
  const router = useRouter();
  const tProd = useTranslations('Products');

  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedProductForBuy, setSelectedProductForBuy] = useState<Product | null>(null);
  const [isWarehouseOffline, setIsWarehouseOffline] = useState(!API_CONFIG.isWarehouseOnline);

  // Subscribe to warehouse health updates
  React.useEffect(() => {
    return API_CONFIG.subscribe(() => {
      setIsWarehouseOffline(!API_CONFIG.isWarehouseOnline);
    });
  }, []);

  const { products, pagination, isLoading, refetch } = useProducts({
    category,
    search,
    page,
    limit: 6,
  });

  const handleCategoryChange = (newCat: string) => {
    setCategory(newCat);
    setPage(1);
  };

  const handleOrderSuccess = (orderId: string) => {
    router.push(`/orders/${orderId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <Typography variant="h2" weight="bold" className="mb-2">
            {tProd('catalogTitle')}
          </Typography>
          <Typography variant="body-sm" color="muted">
            {tProd('catalogSubtitle')}
          </Typography>
        </div>

        {/* Search */}
        <div className="w-full md:w-72">
          <Input
            placeholder="ابحث عن منتج..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            startIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {/* Warehouse Status Alert (Requirement 2 Failure State) */}
      <WarehouseStatusAlert
        isOffline={isWarehouseOffline}
        onRetry={() => {
          API_CONFIG.setWarehouseOnline(true);
          setIsWarehouseOffline(false);
          refetch();
        }}
      />

      {/* Categories Bar */}
      <div className="mb-6">
        <CategoryFilter
          selectedCategory={category}
          onSelectCategory={handleCategoryChange}
        />
      </div>

      {/* Grid or Loading State */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center text-text-secondary gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          <Typography variant="body-sm">جاري جلب المنتجات والمخزون اللحظي...</Typography>
        </div>
      ) : products.length === 0 ? (
        <div className="py-20 text-center bg-surface border border-border rounded-2xl p-8">
          <Typography variant="h4" weight="semibold" className="mb-2">
            لا توجد منتجات مطابقة
          </Typography>
          <Typography variant="body-sm" color="muted">
            جرب اختيار تصنيف آخر أو تغيير كلمة البحث.
          </Typography>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isWarehouseOffline={isWarehouseOffline}
              onQuickBuy={(prod) => setSelectedProductForBuy(prod)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <PaginationControl
        currentPage={pagination.page}
        totalPages={pagination.totalPages}
        onPageChange={(p) => setPage(p)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        product={selectedProductForBuy}
        isOpen={!!selectedProductForBuy}
        onClose={() => setSelectedProductForBuy(null)}
        onOrderSuccess={handleOrderSuccess}
      />
    </div>
  );
};
