'use client';

import React, { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProducts } from '@/features/products/hooks/use-products';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { useInventory } from '@/features/inventory/hooks/use-inventory';
import { Product, ProductCategory } from '@/features/products/types';
import { OrderStatus } from '@/features/orders/types';
import { API_CONFIG } from '@/lib/api-config';
import { productsApi } from '@/features/products/apis/products-api';
import { ordersApi } from '@/features/orders/apis/orders-api';
import { toast } from 'sonner';
import Image from 'next/image';
import {
  Package,
  ShoppingCart,
  Shield,
  User,
  Zap,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Plus,
  Lock,
  Search,
} from 'lucide-react';

export const SimpleStoreView: React.FC = () => {
  const { user, availableUsers, switchUser, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'tests'>('products');

  // --- Tab 1: Products state ---
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const { products, pagination, createProduct, isCreating, refetch: refetchProducts } = useProducts({
    category: selectedCategory,
    search,
    page,
    limit: 6,
  });

  // Simple Add Product form (Admin only)
  const [newProdName, setNewProdName] = useState('');
  const [newProdCat, setNewProdCat] = useState<ProductCategory>('electronics');
  const [newProdPrice, setNewProdPrice] = useState('150');
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdImage, setNewProdImage] = useState(
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80'
  );

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('المتطلب الأول: إضافة المنتجات مقتصرة على المسؤول (Admin) فقط!');
      return;
    }
    await createProduct({
      name: newProdName,
      category: newProdCat,
      price: Number(newProdPrice),
      initialStock: Number(newProdStock),
      imageUrl: newProdImage,
      description: 'منتج مضاف من لوحة المسؤول',
    });
    setNewProdName('');
  };

  // Simple Quick Buy (Customer creates order)
  const { createOrder, isCreating: isOrdering } = useOrders();
  const handleQuickBuy = async (prod: Product) => {
    if (!API_CONFIG.isWarehouseOnline) {
      toast.error('المتطلب الثاني: خدمة المستودع متوقفة حالياً. تعذر حجز المخزون.');
      return;
    }
    if (prod.stock <= 0) {
      toast.error('المتطلب الثاني: الكمية غير كافية في المستودع.');
      return;
    }
    try {
      const order = await createOrder({
        customerId: user?.id || 'user-customer-1',
        shippingAddress: 'عنوان الزبون الافتراضي',
        items: [{ productId: prod.id, quantity: 1 }],
      });
      toast.success(`تم إنشاء الطلب #${order.id} بنجاح وحجز القطعة من المستودع!`);
      refetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'فشل إنشاء الطلب');
    }
  };

  // --- Tab 2: Orders state ---
  const { orders, updateStatus } = useOrders();
  const [forbiddenAlert, setForbiddenAlert] = useState<string | null>(null);

  const handleTestForbiddenAccess = async () => {
    // If user is Customer 1, try to access Customer 2's order (ord-2001)
    try {
      await ordersApi.getOrderById('ord-2001', user);
      setForbiddenAlert(null);
      toast.info('تم جلب الطلب بنجاح (لأنك مسؤول حالياً)');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setForbiddenAlert(
          'تم الرفض بنجاح (HTTP 403 Forbidden): مستخدم يحاول الوصول لطلب غيره ليست من صلاحيته.'
        );
        toast.error('HTTP 403 Forbidden: تم رفض الوصول للطلب غير المصرح!');
      }
    }
  };

  // --- Tab 3: Interview Tests (Race Condition & Warehouse Down) ---
  const [warehouseOnline, setWarehouseOnline] = useState<boolean>(API_CONFIG.isWarehouseOnline);
  const [raceStock, setRaceStock] = useState<number>(1);
  const [isSimulatingRace, setIsSimulatingRace] = useState(false);
  const [raceResult1, setRaceResult1] = useState<string>('في انتظار التجربة...');
  const [raceResult2, setRaceResult2] = useState<string>('في انتظار التجربة...');

  const toggleWarehouse = () => {
    const next = !warehouseOnline;
    API_CONFIG.setWarehouseOnline(next);
    setWarehouseOnline(next);
    toast.info(`خدمة المستودع (gRPC) أصبحت: ${next ? 'متصلة' : 'متوقفة / غير متاحة'}`);
    refetchProducts();
  };

  const handleResetRaceStock = () => {
    setRaceStock(1);
    productsApi.updateStock('prod-race-condition', 1 - raceStock);
    setRaceResult1('في انتظار التجربة...');
    setRaceResult2('في انتظار التجربة...');
    toast.success('تمت إعادة ضبط المخزون لقطعة واحدة (1)');
    refetchProducts();
  };

  const handleRunRaceCondition = async () => {
    setIsSimulatingRace(true);
    setRaceResult1('جاري إرسال الطلب...');
    setRaceResult2('جاري إرسال الطلب...');

    const p1 = ordersApi.createOrder(
      {
        customerId: 'user-customer-1',
        shippingAddress: 'عنوان الزبون 1',
        items: [{ productId: 'prod-race-condition', quantity: 1 }],
      },
      'أحمد (زبون 1)'
    );

    const p2 = ordersApi.createOrder(
      {
        customerId: 'user-customer-2',
        shippingAddress: 'عنوان الزبون 2',
        items: [{ productId: 'prod-race-condition', quantity: 1 }],
      },
      'سارة (زبون 2)'
    );

    const [r1, r2] = await Promise.allSettled([p1, p2]);

    if (r1.status === 'fulfilled') {
      setRaceResult1(`✅ نجح الطلب #${r1.value.id} وتم حجز القطعة الأخيرة!`);
    } else {
      setRaceResult1(`❌ رُفض الطلب: ${r1.reason?.response?.data?.message || r1.reason?.message}`);
    }

    if (r2.status === 'fulfilled') {
      setRaceResult2(`✅ نجح الطلب #${r2.value.id} وتم حجز القطعة الأخيرة!`);
    } else {
      setRaceResult2(`❌ رُفض الطلب: ${r2.reason?.response?.data?.message || r2.reason?.message}`);
    }

    try {
      const prod = await productsApi.getProductById('prod-race-condition');
      setRaceStock(prod.stock);
    } catch {
      setRaceStock(0);
    }

    setIsSimulatingRace(false);
    refetchProducts();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 font-sans">
      {/* 1. Ultra Simple Top Bar: Current Role & Switcher */}
      <div className="bg-surface border border-border rounded-xl p-3 mb-6 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-main">المستخدم الحالي:</span>
          <span className="px-2.5 py-1 rounded-md bg-primary-500/10 text-primary-500 font-bold border border-primary-500/30">
            {user?.name} ({user?.role === 'ADMIN' ? 'مسؤول Admin' : 'زبون Customer'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-text-secondary">تبديل الحساب:</span>
          {availableUsers.map((u) => (
            <button
              key={u.id}
              onClick={() => switchUser(u)}
              className={`px-2.5 py-1 rounded-md font-medium cursor-pointer transition-colors ${
                user?.id === u.id
                  ? 'bg-primary-500 text-white'
                  : 'bg-surface-2 text-text-secondary hover:text-text-main border border-border'
              }`}
            >
              {u.role === 'ADMIN' ? '👑 مسؤول' : u.id === 'user-customer-1' ? '👤 زبون 1' : '👤 زبون 2'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Warehouse Status Warning Banner (Slide 12: مهلة محددة ورد واضح عند التوقف) */}
      {!warehouseOnline && (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 p-3 rounded-xl mb-6 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              <strong>المتطلب الثاني:</strong> خدمة المستودع (gRPC) متوقفة حالياً. لن يُسمح بحجز أي طلب حتى عودة الخدمة لتفادي أخطاء المخزون.
            </span>
          </div>
          <button
            onClick={toggleWarehouse}
            className="px-2.5 py-1 rounded bg-amber-600 text-white font-bold cursor-pointer hover:bg-amber-700 shrink-0"
          >
            إعادة التشغيل
          </button>
        </div>
      )}

      {/* 3. Simple Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3 mb-6">
        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'products'
              ? 'bg-primary-500 text-white shadow-xs'
              : 'bg-surface text-text-secondary hover:text-text-main border border-border'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>المنتجات والمخزون (Products)</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'orders'
              ? 'bg-primary-500 text-white shadow-xs'
              : 'bg-surface text-text-secondary hover:text-text-main border border-border'
          }`}
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>الطلبات والصلاحيات (Orders & RBAC)</span>
        </button>

        <button
          onClick={() => setActiveTab('tests')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all ${
            activeTab === 'tests'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-surface text-text-secondary hover:text-text-main border border-border'
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          <span>إثباتات المقابلة (Race Condition & Tests)</span>
        </button>
      </div>

      {/* TAB 1: PRODUCTS */}
      {activeTab === 'products' && (
        <div className="space-y-6">
          {/* Controls: Search, Filter, Pagination */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-text-secondary">التصنيف:</span>
              {['all', 'electronics', 'fashion', 'home'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-md font-semibold cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface-2 text-text-secondary hover:bg-muted'
                  }`}
                >
                  {cat === 'all'
                    ? 'الكل'
                    : cat === 'electronics'
                    ? 'إلكترونيات'
                    : cat === 'fashion'
                    ? 'أزياء'
                    : 'منزل'}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="بحث عن منتج..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-8 px-3 rounded-md border border-border bg-surface text-xs focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {/* Simple Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div
                key={p.id}
                className="bg-surface border border-border rounded-xl p-3.5 flex flex-col justify-between gap-3 shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-surface-2 shrink-0 border border-border">
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-bold text-xs text-text-main truncate" title={p.name}>
                      {p.name}
                    </h4>
                    <span className="text-[11px] font-semibold text-primary-500 block mt-0.5">
                      {p.price} ر.س
                    </span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded inline-block mt-1 ${
                        !warehouseOnline
                          ? 'bg-red-500/10 text-red-600'
                          : p.stock <= 0
                          ? 'bg-red-500/10 text-red-600'
                          : p.stock <= 2
                          ? 'bg-amber-500/10 text-amber-600'
                          : 'bg-emerald-500/10 text-emerald-600'
                      }`}
                    >
                      {!warehouseOnline
                        ? 'المستودع معطل'
                        : p.stock <= 0
                        ? 'نفد المخزون'
                        : `متوفر بالمستودع: ${p.stock}`}
                    </span>
                  </div>
                </div>

                <button
                  disabled={p.stock <= 0 || !warehouseOnline || isOrdering}
                  onClick={() => handleQuickBuy(p)}
                  className="w-full py-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors shadow-xs"
                >
                  {p.stock <= 0 ? 'نفد من المخزون' : 'شراء فوري وحجز المخزون'}
                </button>
              </div>
            ))}
          </div>

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 text-xs">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1 rounded bg-surface-2 border border-border disabled:opacity-40 cursor-pointer"
              >
                السابق
              </button>
              <span className="font-semibold text-text-secondary">
                صفحة {pagination.page} من {pagination.totalPages}
              </span>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1 rounded bg-surface-2 border border-border disabled:opacity-40 cursor-pointer"
              >
                التالي
              </button>
            </div>
          )}

          {/* Simple Admin Add Product Section (Requirement 1: إضافة منتج مع صورة) */}
          <div className="border-t border-border pt-6">
            <div className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="font-bold text-xs text-text-main flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-primary-500" />
                  <span>إضافة منتج جديد</span>
                </span>
                {!isAdmin && (
                  <span className="text-[10px] text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded font-bold">
                    يتطلب حساب مسؤول
                  </span>
                )}
              </div>

              <form onSubmit={handleCreateProduct} className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
                <input
                  type="text"
                  placeholder="اسم المنتج"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="h-8 px-2.5 rounded-md border border-border bg-surface text-xs focus:outline-none focus:border-primary-500 sm:col-span-1"
                  required
                />
                <select
                  value={newProdCat}
                  onChange={(e) => setNewProdCat(e.target.value as ProductCategory)}
                  className="h-8 px-2 rounded-md border border-border bg-surface text-xs focus:outline-none"
                >
                  <option value="electronics">إلكترونيات</option>
                  <option value="fashion">أزياء</option>
                  <option value="home">منزل</option>
                </select>
                <input
                  type="number"
                  placeholder="السعر (ر.س)"
                  value={newProdPrice}
                  onChange={(e) => setNewProdPrice(e.target.value)}
                  className="h-8 px-2.5 rounded-md border border-border bg-surface text-xs focus:outline-none"
                  required
                />
                <input
                  type="number"
                  placeholder="الكمية بالمستودع"
                  value={newProdStock}
                  onChange={(e) => setNewProdStock(e.target.value)}
                  className="h-8 px-2.5 rounded-md border border-border bg-surface text-xs focus:outline-none"
                  required
                />
                <input
                  type="url"
                  placeholder="رابط صورة المنتج"
                  value={newProdImage}
                  onChange={(e) => setNewProdImage(e.target.value)}
                  className="h-8 px-2.5 rounded-md border border-border bg-surface text-xs focus:outline-none sm:col-span-3"
                  required
                />
                <button
                  type="submit"
                  disabled={!isAdmin || isCreating}
                  className="h-8 px-4 rounded-md bg-primary-500 text-white font-bold text-xs disabled:opacity-40 cursor-pointer hover:bg-primary-600 sm:col-span-1"
                >
                  {isCreating ? 'جاري الحفظ...' : 'إضافة المنتج'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS & RBAC */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Proof 1: RBAC 403 Forbidden Trigger Button */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="font-bold text-text-main block">
                المتطلب الأول: إثبات الصلاحيات (Slide 08)
              </span>
              <span className="text-text-secondary">
                الزبون يرى طلباته فقط. اضغط للتجربة ومعاينة الرفض عند محاولة الوصول لطلب زبون آخر:
              </span>
            </div>
            <button
              onClick={handleTestForbiddenAccess}
              className="px-3.5 py-2 rounded-lg bg-red-500/10 text-red-600 hover:bg-red-500/20 border border-red-500/30 font-bold cursor-pointer shrink-0"
            >
              🔒 تجربة فتح طلب زبون آخر (إثبات 403)
            </button>
          </div>

          {forbiddenAlert && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-600 text-xs font-semibold flex items-center gap-2">
              <XCircle className="w-4 h-4 shrink-0" />
              <span>{forbiddenAlert}</span>
            </div>
          )}

          {/* Orders Table */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
            <div className="p-3 bg-surface-2 border-b border-border flex items-center justify-between text-xs">
              <span className="font-bold text-text-main">
                {isAdmin ? 'جميع طلبات المتجر (صلاحية مسؤول)' : `طلباتي فقط (${user?.name})`}
              </span>
              <span className="text-text-secondary">العدد: {orders.length}</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-start">
                <thead className="bg-surface-2/50 text-text-secondary font-semibold border-b border-border">
                  <tr>
                    <th className="p-3 text-start">رقم الطلب</th>
                    <th className="p-3 text-start">الزبون</th>
                    <th className="p-3 text-start">العناصر</th>
                    <th className="p-3 text-start">الإجمالي</th>
                    <th className="p-3 text-start">الحالة</th>
                    <th className="p-3 text-start">تغيير الحالة (مسؤول فقط)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-text-secondary">
                        لا توجد طلبات لهذا المستخدم حالياً.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface-2/30">
                        <td className="p-3 font-mono font-bold text-text-main">#{o.id}</td>
                        <td className="p-3">{o.customerName}</td>
                        <td className="p-3 text-text-secondary">
                          {o.items.map((it) => it.productName).join('، ')} ({o.items.length})
                        </td>
                        <td className="p-3 font-bold text-primary-500">{o.totalAmount} ر.س</td>
                        <td className="p-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              o.status === 'DELIVERED'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : o.status === 'CANCELLED'
                                ? 'bg-red-500/10 text-red-600'
                                : 'bg-primary-500/10 text-primary-500'
                            }`}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td className="p-3">
                          {isAdmin ? (
                            <select
                              value={o.status}
                              onChange={(e) =>
                                updateStatus({
                                  orderId: o.id,
                                  status: e.target.value as OrderStatus,
                                })
                              }
                              className="h-7 px-2 rounded border border-border bg-surface text-xs focus:outline-none"
                            >
                              <option value="PENDING">PENDING (قيد الانتظار)</option>
                              <option value="PROCESSING">PROCESSING (جاري التجهيز)</option>
                              <option value="SHIPPED">SHIPPED (تم الشحن)</option>
                              <option value="DELIVERED">DELIVERED (تم التسليم)</option>
                              <option value="CANCELLED">CANCELLED (ملغي)</option>
                            </select>
                          ) : (
                            <span className="text-[10px] text-text-secondary">
                              🔒 محظور (مسؤول فقط)
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: INTERVIEW TESTS (RACE CONDITION & DOWNTIME) */}
      {activeTab === 'tests' && (
        <div className="space-y-6">
          {/* Test 1: Race Condition Proof (Slide 13) */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-border mb-4">
              <div>
                <h4 className="font-bold text-sm text-text-main flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>المتطلب الثاني: اختبار السباق (Race Condition on Last Piece)</span>
                </h4>
                <p className="text-xs text-text-secondary mt-0.5">
                  الشرط: عدة طلبات متزامنة في نفس اللحظة على آخر قطعة. النتيجة: ينجح طلب واحد فقط، ويُرفض الآخر.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-text-main">
                  الكمية المتبقية: <strong className="text-primary-500">{raceStock}</strong>
                </span>
                <button
                  onClick={handleResetRaceStock}
                  className="flex items-center gap-1 px-2.5 py-1 rounded bg-surface-2 border border-border text-xs font-semibold cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>إعادة لقطعة واحدة (1)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-lg border border-border bg-surface-2 text-xs">
                <span className="font-bold block mb-1">الطلب الأول (أحمد - زبون 1):</span>
                <p className="text-text-main font-medium">{raceResult1}</p>
              </div>

              <div className="p-3 rounded-lg border border-border bg-surface-2 text-xs">
                <span className="font-bold block mb-1">الطلب الثاني (سارة - زبون 2):</span>
                <p className="text-text-main font-medium">{raceResult2}</p>
              </div>
            </div>

            <button
              disabled={isSimulatingRace}
              onClick={handleRunRaceCondition}
              className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs cursor-pointer shadow-xs disabled:opacity-50"
            >
              {isSimulatingRace ? 'جاري إرسال الطلبين في نفس اللحظة...' : '🚀 إطلاق طلبين متزامنين على آخر قطعة الآن'}
            </button>
          </div>

          {/* Test 2: Warehouse Downtime & Timeout Proof (Slide 12 & 13) */}
          <div className="bg-surface border border-border rounded-xl p-5 shadow-xs">
            <h4 className="font-bold text-sm text-text-main flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>المتطلب الثاني: اختبار توقف خدمة المستودع (Warehouse Timeout / Offline)</span>
            </h4>
            <p className="text-xs text-text-secondary mb-4 leading-relaxed">
              المطلوب: اعرضوا ماذا يرى المستخدم عندما تتوقف خدمة المستودع (لا ينتظر بلا نهاية ويحصل على رد واضح).
            </p>

            <div className="flex items-center gap-4">
              <button
                onClick={toggleWarehouse}
                className={`px-4 py-2 rounded-lg font-bold text-xs cursor-pointer text-white transition-colors ${
                  warehouseOnline ? 'bg-red-500 hover:bg-red-600' : 'bg-emerald-600 hover:bg-emerald-700'
                }`}
              >
                {warehouseOnline ? 'تعطيل خدمة المستودع (Simulate Down)' : 'تشغيل خدمة المستودع (Online)'}
              </button>
              <span className="text-xs text-text-secondary">
                الحالة الحالية: <strong className={warehouseOnline ? 'text-emerald-600' : 'text-red-500'}>
                  {warehouseOnline ? 'متصلة (Online)' : 'متوقفة (Offline)'}
                </strong>
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
