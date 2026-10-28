export type ProductCategory = 'electronics' | 'fashion' | 'home' | 'books';

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  imageUrl: string;
  stock: number; // Current stock count (from Warehouse gRPC)
  createdAt?: string;
}

export interface ProductFilterParams {
  category?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateProductDto {
  name: string;
  category: ProductCategory;
  price: number;
  description: string;
  imageUrl: string;
  initialStock: number;
}
