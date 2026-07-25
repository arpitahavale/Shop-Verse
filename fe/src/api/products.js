import { apiRequest } from './client';

export const fetchProducts = (category) => {
  const qs = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiRequest(`/api/products${qs}`);
};

export const fetchProductById = (id) =>
  apiRequest(`/api/products/${id}`);
