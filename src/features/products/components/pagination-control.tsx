import React from 'react';
import { Button } from '@/components/shared/button';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslations } from '@/hooks/use-translations';

export interface PaginationControlProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControl: React.FC<PaginationControlProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  const tProd = useTranslations('Products');

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-3 mt-8">
      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        startIcon={<ChevronRight className="w-4 h-4" />}
      >
        السابق
      </Button>

      <span className="text-xs text-text-secondary font-medium">
        {tProd('paginationPage')} {currentPage} {tProd('paginationOf')} {totalPages}
      </span>

      <Button
        variant="secondary"
        size="sm"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        endIcon={<ChevronLeft className="w-4 h-4" />}
      >
        التالي
      </Button>
    </div>
  );
};
