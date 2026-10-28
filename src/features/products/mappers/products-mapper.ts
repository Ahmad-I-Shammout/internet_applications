import { Product } from '../types';

export function mapProductFromDto(raw: any): Product {
  return {
    id: raw.id || raw.product_id || raw._id || '',
    name: raw.name || raw.title || '',
    category: raw.category || 'electronics',
    price: Number(raw.price || 0),
    description: raw.description || '',
    imageUrl: raw.imageUrl || raw.image_url || raw.image || '',
    stock: Number(raw.stock ?? raw.quantity ?? raw.inventory_count ?? 0),
    createdAt: raw.createdAt || raw.created_at,
  };
}

export function mapProductsListFromDto(rawList: any[]): Product[] {
  return (rawList || []).map(mapProductFromDto);
}
