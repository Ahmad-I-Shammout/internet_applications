'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useProducts } from '@/features/products/hooks/use-products';
import { useOrders } from '@/features/orders/hooks/use-orders';
import { Product, ProductCategory } from '@/features/products/types';
import { OrderStatus } from '@/features/orders/types';
import { API_CONFIG } from '@/lib/api-config';
import { ordersApi } from '@/features/orders/apis/orders-api';
import { productsApi } from '@/features/products/apis/products-api';
import { toast } from 'sonner';
import {
  Package,
  ShoppingCart,
  Lock,
  Plus,
  Sun,
  Moon,
  XCircle,
  Search,
  Pencil,
  Trash2,
} from 'lucide-react';

export const TidyStoreView: React.FC = () => {
  const { user, availableUsers, switchUser, isAdmin, login, isLoggingIn } = useAuth();
  const [currentTab, setCurrentTab] = useState<'products' | 'orders' | 'auth'>('products');

  // --- Dark mode toggle ---
  const [isDark, setIsDark] = useState(false);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsDark(document.documentElement.classList.contains('dark'));
    }
  }, []);

  const toggleTheme = () => {
    if (typeof window !== 'undefined') {
      const root = document.documentElement;
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        setIsDark(false);
      } else {
        root.classList.add('dark');
        setIsDark(true);
      }
    }
  };

  // --- Tab 1: Products state ---
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const { products, pagination, createProduct, isCreating, refetch: refetchProducts } = useProducts({
    category,
    search,
    page,
    limit: 6,
  });

  // Admin Add Product form
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [pName, setPName] = useState('');
  const [pCategory, setPCategory] = useState<ProductCategory>('electronics');
  const [pPrice, setPPrice] = useState('200');
  const [pImage, setPImage] = useState(
    'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=500&q=80'
  );

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) {
      toast.error('المتطلب الأول: إضافة منتج مقتصرة على المسؤول (Admin) فقط!');
      return;
    }
    await createProduct({
      name: pName,
      category: pCategory,
      price: Number(pPrice),
      initialStock: 20,
      imageUrl: pImage,
      description: 'منتج مضاف جديد',
    });
    setPName('');
    setShowAddProduct(false);
  };

  // Quick Edit & Delete Product state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleDeleteProduct = async (id: string) => {
    await productsApi.deleteProduct(id);
    toast.success('تم حذف المنتج بنجاح');
    refetchProducts();
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    await productsApi.updateProduct(editingProduct.id, {
      name: editingProduct.name,
      price: Number(editingProduct.price),
      category: editingProduct.category,
    });
    toast.success('تم حفظ التعديلات بنجاح');
    setEditingProduct(null);
    refetchProducts();
  };

  // Quick Buy (Order Creation)
  const { orders, createOrder, updateStatus } = useOrders(user);

  const handleBuy = async (p: Product) => {
    try {
      const ord = await createOrder({
        customerId: user?.id || 'user-customer-1',
        shippingAddress: 'عنوان الزبون',
        items: [{ productId: p.id, quantity: 1 }],
      });
      toast.success(`تم إنشاء الطلب #${ord.id} بنجاح!`);
      refetchProducts();
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || 'فشل إنشاء الطلب');
    }
  };

  // --- Tab 2: Orders & RBAC 403 Proof ---
  const [rbacError, setRbacError] = useState<string | null>(null);

  const handleTest403 = async () => {
    try {
      // If user is Customer 1, try to access Customer 2's order
      const targetOrderId = user?.id === 'user-customer-2' ? 'ord-1001' : 'ord-2001';
      await ordersApi.getOrderById(targetOrderId, user);
      setRbacError(null);
      toast.info('تم جلب الطلب بنجاح (لأنك مسؤول حالياً)');
    } catch (err: any) {
      if (err.response?.status === 403) {
        setRbacError(
          'تم الرفض بنجاح (HTTP 403 Forbidden): مستخدم يحاول الوصول لطلب غيره. رُفضت العملية لحماية الخصوصية.'
        );
        toast.error('HTTP 403 Forbidden: تم رفض محاولة الوصول لطلب زبون آخر!');
      }
    }
  };

  // --- Tab 3: Auth & Rate Limiting ---
  const [authEmail, setAuthEmail] = useState('customer1@store.local');
  const [authPassword, setAuthPassword] = useState('password123');
  const [rateLimitErr, setRateLimitErr] = useState('');

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimitErr('');
    try {
      await login({ email: authEmail, password: authPassword });
    } catch (err: any) {
      if (err.response?.status === 429) {
        setRateLimitErr('تم حظر تسجيل الدخول (HTTP 429): تم تجاوز الحد المسموح من المحاولات.');
      }
    }
  };

  const simulate429 = () => {
    API_CONFIG.loginAttemptsCount = API_CONFIG.maxLoginAttempts;
    setRateLimitErr('تم تفعيل خطأ HTTP 429: تم حظر محاولات الدخول');
    toast.error('HTTP 429: تم تفعيل تجاوز محاولات تسجيل الدخول');
  };

  const reset429 = () => {
    API_CONFIG.resetLoginAttempts();
    setRateLimitErr('');
    toast.success('تمت إعادة ضبط عداد المحاولات');
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col md:flex-row">
      {/* ===================== SIDEBAR ===================== */}
      <aside className="w-full md:w-64 bg-surface border-e border-border flex flex-col justify-between shrink-0 p-4">
        <div className="space-y-6">
          {/* Logo / Header */}
          <div className="pb-3 border-b border-border">
            <h1 className="text-base font-extrabold text-primary-500 flex items-center gap-2">
              <Package className="w-5 h-5" />
              <span>المتطلب الأول (Page 1)</span>
            </h1>
            <p className="text-[11px] text-text-secondary mt-0.5">REST APIs & Security</p>
          </div>

          {/* Current User Card & Switcher */}
          <div className="bg-surface-2 rounded-xl p-3 border border-border">
            <div className="text-[11px] text-text-secondary mb-1">المستخدم الحالي:</div>
            <div className="font-bold text-xs text-text-main flex items-center justify-between">
              <span>{user?.name}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  isAdmin ? 'bg-primary-500/20 text-primary-500' : 'bg-surface text-text-secondary border border-border'
                }`}
              >
                {isAdmin ? 'مسؤول Admin' : 'زبون Customer'}
              </span>
            </div>

            <div className="mt-2.5 pt-2 border-t border-border flex gap-1">
              {availableUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => {
                    switchUser(u);
                    setRbacError(null);
                  }}
                  className={`flex-1 py-1 rounded text-[10px] font-bold cursor-pointer transition-colors ${
                    user?.id === u.id
                      ? 'bg-primary-500 text-white'
                      : 'bg-surface text-text-secondary hover:text-text-main border border-border'
                  }`}
                >
                  {u.role === 'ADMIN' ? 'مسؤول' : u.id === 'user-customer-1' ? 'زبون 1' : 'زبون 2'}
                </button>
              ))}
            </div>
          </div>

          {/* Nav Links (3 Tabs Only: Requirement 1) */}
          <nav className="space-y-1">
            <button
              onClick={() => setCurrentTab('products')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                currentTab === 'products'
                  ? 'bg-primary-500/15 text-primary-500 dark:text-primary-300'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-2'
              }`}
            >
              <Package className="w-4 h-4" />
              <span>1. المنتجات (Products)</span>
            </button>

            <button
              onClick={() => setCurrentTab('orders')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                currentTab === 'orders'
                  ? 'bg-primary-500/15 text-primary-500 dark:text-primary-300'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-2'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>2. الطلبات والصلاحيات</span>
            </button>

            <button
              onClick={() => setCurrentTab('auth')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                currentTab === 'auth'
                  ? 'bg-primary-500/15 text-primary-500 dark:text-primary-300'
                  : 'text-text-secondary hover:text-text-main hover:bg-surface-2'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>3. المصادقة والأمان</span>
            </button>
          </nav>
        </div>

        {/* Bottom Sidebar: Theme Toggle */}
        <div className="pt-4 border-t border-border">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 py-1.5 rounded-lg border border-border text-xs text-text-secondary hover:text-text-main hover:bg-surface-2 cursor-pointer"
          >
            {isDark ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            <span>{isDark ? 'الوضع الفاتح' : 'الوضع الداكن'}</span>
          </button>
        </div>
      </aside>

      {/* ===================== MAIN CONTENT ===================== */}
      <main className="flex-1 p-6 overflow-y-auto">
        {/* ----------------- TAB 1: PRODUCTS ----------------- */}
        {currentTab === 'products' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-text-main">المنتجات (REST APIs)</h2>
                <p className="text-xs text-text-secondary">عرض المنتجات، تصفية حسب التصنيف، تقسيم صفحات، وإضافة منتج مع صورة</p>
              </div>

              {isAdmin && (
                <button
                  onClick={() => setShowAddProduct(!showAddProduct)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-500 text-white text-xs font-bold hover:bg-primary-600 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{showAddProduct ? 'إلغاء' : 'إضافة منتج مع صورة'}</span>
                </button>
              )}
            </div>

            {/* Admin Add Product Form */}
            {showAddProduct && (
              <form
                onSubmit={handleAddProduct}
                className="bg-surface border border-border rounded-xl p-4 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs shadow-xs"
              >
                <input
                  type="text"
                  placeholder="اسم المنتج"
                  value={pName}
                  onChange={(e) => setPName(e.target.value)}
                  className="h-8 px-2.5 rounded border border-border bg-surface text-xs focus:outline-none focus:border-primary-500"
                  required
                />
                <select
                  value={pCategory}
                  onChange={(e) => setPCategory(e.target.value as ProductCategory)}
                  className="h-8 px-2 rounded border border-border bg-surface text-xs"
                >
                  <option value="electronics">إلكترونيات</option>
                  <option value="fashion">أزياء</option>
                  <option value="home">منزل</option>
                </select>
                <input
                  type="number"
                  placeholder="السعر (ر.س)"
                  value={pPrice}
                  onChange={(e) => setPPrice(e.target.value)}
                  className="h-8 px-2.5 rounded border border-border bg-surface text-xs"
                  required
                />
                <button
                  type="submit"
                  disabled={isCreating}
                  className="h-8 rounded bg-primary-500 text-white font-bold text-xs hover:bg-primary-600 cursor-pointer"
                >
                  {isCreating ? 'جاري الحفظ...' : 'حفظ المنتج'}
                </button>
                <input
                  type="url"
                  placeholder="رابط الصورة"
                  value={pImage}
                  onChange={(e) => setPImage(e.target.value)}
                  className="h-8 px-2.5 rounded border border-border bg-surface text-xs sm:col-span-4"
                  required
                />
              </form>
            )}

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-2.5 rounded-xl border border-border text-xs">
              <div className="flex items-center gap-1">
                {['all', 'electronics', 'fashion', 'home'].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setCategory(cat);
                      setPage(1);
                    }}
                    className={`px-3 py-1 rounded-md font-semibold cursor-pointer ${
                      category === cat
                        ? 'bg-primary-500 text-white'
                        : 'bg-surface-2 text-text-secondary hover:text-text-main'
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

              <input
                type="text"
                placeholder="بحث..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="h-7 px-2.5 rounded border border-border bg-surface text-xs focus:outline-none"
              />
            </div>

            {/* Products Table */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-surface-2 text-text-secondary border-b border-border font-semibold">
                  <tr>
                    <th className="p-3 text-start">الصورة</th>
                    <th className="p-3 text-start">الاسم</th>
                    <th className="p-3 text-start">التصنيف</th>
                    <th className="p-3 text-start">السعر</th>
                    <th className="p-3 text-center">الإجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-surface-2/40">
                      <td className="p-3">
                        <div className="relative w-10 h-10 rounded overflow-hidden bg-surface-2 border border-border">
                          <Image src={p.imageUrl} alt={p.name} fill className="object-cover" />
                        </div>
                      </td>
                      <td className="p-3 font-semibold text-text-main">{p.name}</td>
                      <td className="p-3 text-text-secondary">{p.category}</td>
                      <td className="p-3 font-bold text-primary-500">{p.price} ر.س</td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {!isAdmin && (
                            <button
                              onClick={() => handleBuy(p)}
                              className="px-2.5 py-1 rounded bg-primary-500 hover:bg-primary-600 text-white font-bold text-[11px] cursor-pointer shadow-xs"
                            >
                              طلب
                            </button>
                          )}
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1 rounded text-text-secondary hover:text-text-main hover:bg-surface-2 transition-colors cursor-pointer"
                            title="تعديل المنتج"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id)}
                            className="p-1 rounded text-destructive/70 hover:text-destructive hover:bg-destructive/10 transition-colors cursor-pointer"
                            title="حذف المنتج"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 text-xs pt-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-3 py-1 rounded border border-border bg-surface disabled:opacity-40 cursor-pointer"
                >
                  السابق
                </button>
                <span className="text-text-secondary">
                  صفحة {pagination.page} من {pagination.totalPages}
                </span>
                <button
                  disabled={page >= pagination.totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border border-border bg-surface disabled:opacity-40 cursor-pointer"
                >
                  التالي
                </button>
              </div>
            )}

            {/* Quick Edit Modal */}
            {editingProduct && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60">
                <form
                  onSubmit={handleSaveEdit}
                  className="bg-surface border border-border rounded-xl p-5 w-full max-w-sm space-y-3 text-xs shadow-xl animate-in fade-in"
                >
                  <h3 className="font-bold text-sm text-text-main pb-2 border-b border-border">
                    تعديل المنتج
                  </h3>
                  <div>
                    <label className="text-text-secondary block mb-1">اسم المنتج:</label>
                    <input
                      type="text"
                      value={editingProduct.name}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, name: e.target.value })
                      }
                      className="w-full h-8 px-2.5 rounded border border-border bg-surface text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary block mb-1">السعر (ر.س):</label>
                    <input
                      type="number"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, price: Number(e.target.value) })
                      }
                      className="w-full h-8 px-2.5 rounded border border-border bg-surface text-xs focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-text-secondary block mb-1">التصنيف:</label>
                    <select
                      value={editingProduct.category}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          category: e.target.value as ProductCategory,
                        })
                      }
                      className="w-full h-8 px-2 rounded border border-border bg-surface text-xs"
                    >
                      <option value="electronics">إلكترونيات</option>
                      <option value="fashion">أزياء</option>
                      <option value="home">منزل</option>
                    </select>
                  </div>
                  <div className="pt-2 flex items-center justify-end gap-2 border-t border-border">
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-3 py-1.5 rounded border border-border bg-surface text-text-secondary hover:bg-surface-2 cursor-pointer"
                    >
                      إلغاء
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded bg-primary-500 hover:bg-primary-600 text-white font-bold cursor-pointer"
                    >
                      حفظ التعديل
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* ----------------- TAB 2: ORDERS & RBAC ----------------- */}
        {currentTab === 'orders' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-text-main">
                  {isAdmin ? 'جميع طلبات المتجر (صلاحية مسؤول)' : `طلباتي فقط (${user?.name})`}
                </h2>
                <p className="text-xs text-text-secondary">
                  المتطلب الأول: الزبون يرى طلباته فقط، والمسؤول يرى الكل ويغير الحالة
                </p>
              </div>

              {!isAdmin && (
                <button
                  onClick={handleTest403}
                  className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 border border-red-500/30 text-xs font-bold cursor-pointer"
                >
                  🔒 اختبار فتح طلب غيري (إثبات 403)
                </button>
              )}
            </div>

            {rbacError && (
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold flex items-center gap-2">
                <XCircle className="w-4 h-4 shrink-0" />
                <span>{rbacError}</span>
              </div>
            )}

            <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
              <table className="w-full text-xs text-start">
                <thead className="bg-surface-2 text-text-secondary border-b border-border font-semibold">
                  <tr>
                    <th className="p-3 text-start">رقم الطلب</th>
                    <th className="p-3 text-start">صاحب الطلب</th>
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
                        لا توجد طلبات مسجلة لهذا الحساب.
                      </td>
                    </tr>
                  ) : (
                    orders.map((o) => (
                      <tr key={o.id} className="hover:bg-surface-2/40">
                        <td className="p-3 font-mono font-bold text-text-main">#{o.id}</td>
                        <td className="p-3">{o.customerName}</td>
                        <td className="p-3 text-text-secondary">
                          {o.items.map((it) => it.productName).join('، ')}
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
                            <span className="text-[10px] text-text-secondary">محظور (صلاحية مسؤول)</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ----------------- TAB 3: AUTH & RATE LIMIT ----------------- */}
        {currentTab === 'auth' && (
          <div className="max-w-md mx-auto space-y-4">
            <div className="pb-3 border-b border-border">
              <h2 className="text-base font-bold text-text-main">المصادقة والأمان (Slide 07)</h2>
              <p className="text-xs text-text-secondary">تسجيل الدخول واختبار حظر المحاولات المتكررة (Rate Limiting: HTTP 429)</p>
            </div>

            {rateLimitErr && (
              <div className="p-3 bg-red-500/10 border border-red-500/30 text-red-600 text-xs font-bold rounded-xl">
                {rateLimitErr}
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="bg-surface border border-border rounded-xl p-5 space-y-3 text-xs">
              <div>
                <label className="font-semibold block mb-1 text-text-secondary">البريد الإلكتروني / المستخدم:</label>
                <input
                  type="email"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full h-8 px-2.5 rounded border border-border bg-surface text-xs focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="font-semibold block mb-1 text-text-secondary">كلمة المرور:</label>
                <input
                  type="password"
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full h-8 px-2.5 rounded border border-border bg-surface text-xs focus:outline-none"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full h-8 rounded bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer"
              >
                {isLoggingIn ? 'جاري التحقق...' : 'تسجيل الدخول'}
              </button>
            </form>

            {/* Rate limit quick test */}
            <div className="bg-surface-2 p-3 rounded-xl border border-border text-xs flex items-center justify-between">
              <span className="text-text-secondary">اختبار خطأ تجاوز المحاولات:</span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={simulate429}
                  className="text-red-500 font-bold hover:underline cursor-pointer"
                >
                  محاكاة 429
                </button>
                <span>•</span>
                <button
                  type="button"
                  onClick={reset429}
                  className="text-primary-500 font-bold hover:underline cursor-pointer"
                >
                  تصفير العداد
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
