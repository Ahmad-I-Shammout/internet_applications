import { Product } from '../types';

export const initialMockProducts: Product[] = [
  {
    id: 'prod-race-condition',
    name: 'سماعات احترافية عازلة للضوضاء (القطعة الأخيرة!)',
    category: 'electronics',
    price: 850,
    description: 'سماعات لاسلكية عالية الدقة تدعم ميزة العزل الصوتي الذكي. متوفرة بقطعة واحدة فقط لاختبار التنافس والسباق (Race Condition).',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80',
    stock: 1, // Crucial for Slide 13 Race Condition demo
    createdAt: '2026-10-28T10:00:00Z',
  },
  {
    id: 'prod-2',
    name: 'ساعة يد ذكية مقاومة للماء',
    category: 'electronics',
    price: 499,
    description: 'شاشة AMOLED ملونة، تتبع النشاط البدني ومعدل نبضات القلب والبطارية تدوم حتى 14 يوماً.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
    stock: 14,
    createdAt: '2026-10-28T09:30:00Z',
  },
  {
    id: 'prod-3',
    name: 'حقيبة ظهر عصرية مقاومة للصدمات',
    category: 'fashion',
    price: 180,
    description: 'حقيبة سفر وعمل متعددة الجيوب مزودة بمنفذ شحن USB وخامات مضادة للماء والخدش.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&q=80',
    stock: 8,
    createdAt: '2026-10-28T09:00:00Z',
  },
  {
    id: 'prod-4',
    name: 'حذاء رياضي خفيف الوزن للركض',
    category: 'fashion',
    price: 320,
    description: 'نعل هوائي مرن يمتص الصدمات مع نسيج شبكي يسمح بالتنفس أثناء ممارسة الرياضة اليومية.',
    imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80',
    stock: 5,
    createdAt: '2026-10-28T08:30:00Z',
  },
  {
    id: 'prod-5',
    name: 'ماكينة تحضير الإسبريسو المنزلية',
    category: 'home',
    price: 1250,
    description: 'مضخة ضغط إيطالية بقوة 15 بار مع ذراع تبخير الحليب لصنع أفضل كوب لاتيه وكابتشينو.',
    imageUrl: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&q=80',
    stock: 4,
    createdAt: '2026-10-28T08:00:00Z',
  },
  {
    id: 'prod-6',
    name: 'مصباح مكتبي ذكي بإضاءة متغيرة',
    category: 'home',
    price: 140,
    description: 'مصباح LED صحي للعين مع إمكانية ضبط درجة حرارة اللون والتحكم باللمس أو التطبيق.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&q=80',
    stock: 12,
    createdAt: '2026-10-28T07:30:00Z',
  },
  {
    id: 'prod-7',
    name: 'لوحة مفاتيح ميكانيكية مخصصة للألعاب',
    category: 'electronics',
    price: 380,
    description: 'مفاتيح حمراء صامتة مع إضاءة RGB قابلة للتخصيص وهيكل ألمنيوم قوي.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&q=80',
    stock: 0, // Out of stock example
    createdAt: '2026-10-28T07:00:00Z',
  },
];

// In-memory / localStorage storage for simulated interactive updates
export function getStoredProducts(): Product[] {
  if (typeof window !== 'undefined') {
    const data = localStorage.getItem('mock_products_list');
    if (data) {
      try {
        return JSON.parse(data);
      } catch {
        // Fallback
      }
    }
  }
  return initialMockProducts;
}

export function saveStoredProducts(products: Product[]): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('mock_products_list', JSON.stringify(products));
  }
}
