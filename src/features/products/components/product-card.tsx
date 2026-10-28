import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '../types';
import { Card } from '@/components/shared/card';
import { Typography } from '@/components/shared/typography';
import { Button } from '@/components/shared/button';
import { Badge } from '@/components/shared/badge';
import { StockBadge } from '@/features/inventory/components/stock-badge';
import { ShoppingCart, Eye } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

export interface ProductCardProps {
  product: Product;
  onQuickBuy?: (product: Product) => void;
  isWarehouseOffline?: boolean;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onQuickBuy,
  isWarehouseOffline = false,
}) => {
  const tProd = useTranslations('Products');
  const tCommon = useTranslations('Common');

  return (
    <Card hoverable className="flex flex-col h-full overflow-hidden p-0 group">
      {/* Product Image */}
      <div className="relative w-full h-48 bg-surface-2 overflow-hidden">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 start-3">
          <Badge variant="default" size="sm" className="bg-surface/90 backdrop-blur-xs">
            {tProd(product.category) || product.category}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow justify-between gap-4">
        <div>
          <div className="flex items-center justify-between gap-2 mb-2">
            <StockBadge stock={product.stock} isWarehouseOffline={isWarehouseOffline} />
            <span className="text-lg font-bold text-primary-500">
              {product.price} {tCommon('currency')}
            </span>
          </div>

          <Typography variant="h5" weight="bold" className="line-clamp-1 mb-1">
            {product.name}
          </Typography>

          <Typography variant="body-sm" color="muted" className="line-clamp-2 text-xs">
            {product.description}
          </Typography>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-border">
          <Link href={`/products/${product.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="w-full" startIcon={<Eye className="w-3.5 h-3.5" />}>
              التفاصيل
            </Button>
          </Link>

          <Button
            variant="brand"
            size="sm"
            className="flex-1"
            disabled={product.stock <= 0 || isWarehouseOffline}
            onClick={() => onQuickBuy && onQuickBuy(product)}
            startIcon={<ShoppingCart className="w-3.5 h-3.5" />}
          >
            {product.stock <= 0 ? 'نفد' : 'شراء'}
          </Button>
        </div>
      </div>
    </Card>
  );
};
