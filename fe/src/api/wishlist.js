import { apiRequest } from './client';

export const fetchWishlist = () => apiRequest('/api/wishlist');

export const addWishlistItem = (productId) =>
  apiRequest('/api/wishlist', {
    method: 'POST',
    body: JSON.stringify({ productId }),
  });

export const removeWishlistItem = (productId) =>
  apiRequest(`/api/wishlist/${productId}`, { method: 'DELETE' });
