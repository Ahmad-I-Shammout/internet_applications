import React from 'react';
import { ShieldAlert, ArrowRight } from 'lucide-react';
import { Typography } from './typography';
import { Button } from './button';
import Link from 'next/link';

export interface ForbiddenStateProps {
  title?: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
}

export const ForbiddenState: React.FC<ForbiddenStateProps> = ({
  title = 'غير مصرح بالوصول (HTTP 403 Forbidden)',
  description = 'المتطلب الأول: مستخدم يحاول الوصول إلى طلب غيره، أو تنفيذ عملية ليست من صلاحيته. النتيجة: يُرفض الطلب لحماية الخصوصية والأمان.',
  backHref = '/orders',
  backLabel = 'العودة إلى طلباتي',
}) => {
  return (
    <div className="w-full max-w-lg mx-auto my-12 p-8 bg-surface border border-destructive/20 rounded-2xl shadow-lg text-center flex flex-col items-center">
      <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive mb-5 animate-bounce">
        <ShieldAlert className="w-8 h-8" />
      </div>

      <Typography variant="h3" weight="bold" className="text-destructive mb-2">
        {title}
      </Typography>

      <Typography variant="body-sm" color="muted" className="mb-6 leading-relaxed max-w-md">
        {description}
      </Typography>

      <div className="p-3 bg-surface-2 rounded-xl text-xs text-text-secondary border border-border mb-6 text-start w-full">
        <span className="font-semibold block text-text-main mb-1">
          إثبات المتطلب الأول (Slide 08):
        </span>
        التحقق من الـ Token وهيكلية الـ RBAC أثبت أن المستخدم الحالي لا يملك صلاحية الاطلاع على هذا المعرف أو تعديله.
      </div>

      <Link href={backHref}>
        <Button variant="brand" startIcon={<ArrowRight className="w-4 h-4" />}>
          {backLabel}
        </Button>
      </Link>
    </div>
  );
};
