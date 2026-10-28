'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProducts } from '../hooks/use-products';
import { ProductCategory } from '../types';
import { Typography } from '@/components/shared/typography';
import { Input } from '@/components/shared/input';
import { Button } from '@/components/shared/button';
import { Card } from '@/components/shared/card';
import { ForbiddenState } from '@/components/shared/forbidden-state';
import { useTranslations } from '@/hooks/use-translations';
import { PlusCircle, Image as ImageIcon, Tag, DollarSign, Boxes, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export const AddProductView: React.FC = () => {
  const router = useRouter();
  const { isAdmin, isReady } = useAuth();
  const { createProduct, isCreating } = useProducts();
  const tProd = useTranslations('Products');

  const [name, setName] = useState('');
  const [category, setCategory] = useState<ProductCategory>('electronics');
  const [price, setPrice] = useState('250');
  const [initialStock, setInitialStock] = useState('10');
  const [imageUrl, setImageUrl] = useState(
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80'
  );
  const [description, setDescription] = useState('');

  if (isReady && !isAdmin) {
    return (
      <ForbiddenState
        title="غير مصرح (403 Forbidden)"
        description="المتطلب الأول (Slide 08): إضافة منتجات جديدة هي صلاحية مخصصة للمسؤول (Admin) فقط. لا يمكن للزبون تنفيذ هذه العملية."
        backHref="/products"
        backLabel="العودة لتصفح المنتجات"
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await createProduct({
        name,
        category,
        price: Number(price),
        initialStock: Number(initialStock),
        imageUrl,
        description,
      });

      router.push('/products');
    } catch {
      // Handled by toast in hook
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-main mb-6 transition-colors"
      >
        <ArrowRight className="w-4 h-4" />
        <span>الرجوع إلى قائمة المنتجات</span>
      </Link>

      <Card className="p-8">
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-border">
          <div className="w-10 h-10 rounded-xl bg-primary-500/10 border border-primary-500/30 flex items-center justify-center text-primary-500">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <Typography variant="h3" weight="bold">
              {tProd('addProductTitle')}
            </Typography>
            <Typography variant="body-sm" color="muted">
              {tProd('addProductSubtitle')}
            </Typography>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label={tProd('productName')}
            placeholder="مثال: ساعة يد ذكية فاخرة"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5 text-start">
              <label className="text-xs font-medium text-text-secondary">
                {tProd('productCategory')}
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full h-10 rounded-lg border border-border bg-surface text-text-main text-sm px-3 focus:outline-none focus:border-primary-500"
              >
                <option value="electronics">{tProd('electronics')}</option>
                <option value="fashion">{tProd('fashion')}</option>
                <option value="home">{tProd('home')}</option>
              </select>
            </div>

            <Input
              label={tProd('productPrice')}
              type="number"
              min="1"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              startIcon={<DollarSign className="w-4 h-4" />}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label={tProd('initialStock')}
              type="number"
              min="0"
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              startIcon={<Boxes className="w-4 h-4" />}
              required
            />

            <Input
              label={tProd('imageUrl')}
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              startIcon={<ImageIcon className="w-4 h-4" />}
              required
            />
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div className="p-3 bg-surface-2 rounded-xl flex items-center gap-3">
              <div className="relative w-16 h-16 rounded-lg overflow-hidden shrink-0 border border-border">
                <Image
                  src={imageUrl}
                  alt="معاينة الصورة"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="text-xs text-text-secondary">
                <span className="font-semibold block text-text-main">
                  معاينة صورة المنتج:
                </span>
                تأكد من وضوح الصورة وتناسقها مع المتجر.
              </div>
            </div>
          )}

          <div className="flex flex-col gap-1.5 text-start">
            <label className="text-xs font-medium text-text-secondary">
              {tProd('productDescription')}
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب مواصفات المنتج وتفاصيله..."
              className="w-full p-3 rounded-lg border border-border bg-surface text-text-main text-sm focus:outline-none focus:border-primary-500"
              required
            />
          </div>

          <Button
            type="submit"
            variant="brand"
            size="lg"
            isLoading={isCreating}
            className="w-full mt-3"
          >
            {tProd('saveProduct')}
          </Button>
        </form>
      </Card>
    </div>
  );
};
