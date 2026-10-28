import React from 'react';
import { useTranslations } from '@/hooks/use-translations';

export interface CategoryFilterProps {
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
}) => {
  const tProd = useTranslations('Products');

  const categories = [
    { key: 'all', label: tProd('allCategories') },
    { key: 'electronics', label: tProd('electronics') },
    { key: 'fashion', label: tProd('fashion') },
    { key: 'home', label: tProd('home') },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.key;
        return (
          <button
            key={cat.key}
            onClick={() => onSelectCategory(cat.key)}
            className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              isSelected
                ? 'bg-primary-500 text-white shadow-sm'
                : 'bg-surface text-text-secondary hover:text-text-main border border-border hover:bg-surface-2'
            }`}
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
};
