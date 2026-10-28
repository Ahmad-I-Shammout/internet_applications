import api from '@/lib/api-client';
import { API_CONFIG } from '@/lib/api-config';
import {
  CreateProductDto,
  PaginatedResponse,
  Product,
  ProductFilterParams,
} from '../types';
import { getStoredProducts, saveStoredProducts } from './mock-data';

export const productsApi = {
  async getProducts(params: ProductFilterParams = {}): Promise<PaginatedResponse<Product>> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));

      let items = [...getStoredProducts()];

      // Filter by category
      if (params.category && params.category !== 'all') {
        items = items.filter((p) => p.category === params.category);
      }

      // Filter by search query
      if (params.search && params.search.trim()) {
        const q = params.search.trim().toLowerCase();
        items = items.filter(
          (p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q)
        );
      }

      const page = params.page || 1;
      const limit = params.limit || 6;
      const total = items.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const startIndex = (page - 1) * limit;
      const paginatedData = items.slice(startIndex, startIndex + limit);

      return {
        data: paginatedData,
        total,
        page,
        limit,
        totalPages,
      };
    }

    // Real API call when backend is available
    const { data } = await api.get('/products', { params });
    return data;
  },

  async getProductById(id: string): Promise<Product> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));

      const items = getStoredProducts();
      const product = items.find((p) => p.id === id);

      if (!product) {
        const error: any = new Error('Product not found');
        error.response = { status: 404, data: { message: 'المنتج غير موجود' } };
        throw error;
      }

      return product;
    }

    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  async createProduct(dto: CreateProductDto): Promise<Product> {
    if (API_CONFIG.useMock) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.mockDelayMs));

      const items = getStoredProducts();
      const newProduct: Product = {
        id: `prod-${Date.now()}`,
        name: dto.name,
        category: dto.category,
        price: Number(dto.price),
        description: dto.description,
        imageUrl:
          dto.imageUrl ||
          'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80',
        stock: Number(dto.initialStock || 10),
        createdAt: new Date().toISOString(),
      };

      const updated = [newProduct, ...items];
      saveStoredProducts(updated);
      return newProduct;
    }

    const { data } = await api.post('/products', dto);
    return data;
  },

  async updateStock(id: string, delta: number): Promise<Product> {
    const items = getStoredProducts();
    const index = items.findIndex((p) => p.id === id);
    if (index !== -1) {
      items[index].stock = Math.max(0, items[index].stock + delta);
      saveStoredProducts([...items]);
      return items[index];
    }
    throw new Error('Product not found');
  },

  async deleteProduct(id: string): Promise<void> {
    if (API_CONFIG.useMock) {
      const items = getStoredProducts().filter((p) => p.id !== id);
      saveStoredProducts(items);
      return;
    }
    await api.delete(`/products/${id}`);
  },

  async updateProduct(id: string, data: Partial<CreateProductDto>): Promise<Product> {
    if (API_CONFIG.useMock) {
      const items = getStoredProducts();
      const index = items.findIndex((p) => p.id === id);
      if (index !== -1) {
        items[index] = {
          ...items[index],
          ...data,
          price: data.price !== undefined ? Number(data.price) : items[index].price,
        };
        saveStoredProducts([...items]);
        return items[index];
      }
      throw new Error('Product not found');
    }
    const res = await api.put(`/products/${id}`, data);
    return res.data;
  },
};
