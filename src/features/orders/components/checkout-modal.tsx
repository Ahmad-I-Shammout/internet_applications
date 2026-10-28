'use client';

import React, { useState } from 'react';
import { Modal } from '@/components/shared/modal';
import { Typography } from '@/components/shared/typography';
import { Input } from '@/components/shared/input';
import { Button } from '@/components/shared/button';
import { Product } from '@/features/products/types';
import { useOrders } from '../hooks/use-orders';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useTranslations } from '@/hooks/use-translations';
import { MapPin, ShoppingBag, AlertCircle } from 'lucide-react';
import Image from 'next/image';

export interface CheckoutModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess?: (orderId: string) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  product,
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { user } = useAuth();
  const { createOrder, isCreating } = useOrders();
  const tOrders = useTranslations('Orders');
  const tCommon = useTranslations('Common');

  const [quantity, setQuantity] = useState(1);
  const [shippingAddress, setShippingAddress] = useState('الرياض - شارع العليا');
  const [errorMsg, setErrorMsg] = useState('');

  if (!product) return null;

  const totalAmount = product.price * quantity;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    try {
      const newOrder = await createOrder({
        customerId: user?.id || 'guest-customer',
        shippingAddress,
        items: [
          {
            productId: product.id,
            quantity,
          },
        ],
      });

      onClose();
      if (onOrderSuccess) {
        onOrderSuccess(newOrder.id);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'فشل حجز المخزون أو إتمام الطلب';
      setErrorMsg(msg);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={tOrders('createOrder')}
      description="المتطلب الأول والثاني: حجز الكمية من خدمة المستودع عبر العقد المشترك قبل حفظ الطلب"
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Product preview */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface-2 border border-border">
          <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0">
            <Image
              src={product.imageUrl}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-text-main truncate">
              {product.name}
            </h4>
            <p className="text-xs text-primary-500 font-semibold mt-0.5">
              {product.price} {tCommon('currency')}
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold block">فشل العملية:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Quantity selector */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-border">
          <span className="text-xs font-medium text-text-secondary">
            الكمية المطلوبة:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={quantity <= 1}
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-muted font-bold text-sm disabled:opacity-40 cursor-pointer"
            >
              -
            </button>
            <span className="w-8 text-center text-sm font-bold">{quantity}</span>
            <button
              type="button"
              disabled={quantity >= product.stock}
              onClick={() => setQuantity((q) => q + 1)}
              className="w-8 h-8 rounded-lg bg-surface-2 hover:bg-muted font-bold text-sm disabled:opacity-40 cursor-pointer"
            >
              +
            </button>
          </div>
        </div>

        {/* Shipping address */}
        <Input
          label={tOrders('shippingAddress')}
          value={shippingAddress}
          onChange={(e) => setShippingAddress(e.target.value)}
          startIcon={<MapPin className="w-4 h-4" />}
          required
        />

        {/* Total calculation */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-text-secondary">الإجمالي المستحق:</span>
          <span className="text-lg font-bold text-primary-500">
            {totalAmount} {tCommon('currency')}
          </span>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          variant="brand"
          size="lg"
          isLoading={isCreating}
          disabled={product.stock <= 0}
          className="w-full mt-2"
          startIcon={<ShoppingBag className="w-4 h-4" />}
        >
          {tOrders('createOrder')}
        </Button>
      </form>
    </Modal>
  );
};
