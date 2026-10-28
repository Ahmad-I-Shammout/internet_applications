import { OrderDetailView } from '@/features/orders/components/order-detail-view';
import { initialMockOrders } from '@/features/orders/apis/mock-data';

export function generateStaticParams() {
  return initialMockOrders.map((o) => ({
    id: o.id,
  }));
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
