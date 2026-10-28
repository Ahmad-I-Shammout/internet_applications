import { ProductDetailView } from '@/features/products/components/product-detail-view';
import { initialMockProducts } from '@/features/products/apis/mock-data';

export function generateStaticParams() {
  return initialMockProducts.map((p) => ({
    id: p.id,
  }));
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductDetailView productId={id} />;
}
