import { apiRequest } from './client';

export const fetchCart = () => apiRequest('/api/cart');

export const addCartItem = (productId, quantity = 1) =>
  apiRequest('/api/cart/items', {
    method: 'POST',
    body: JSON.stringify({ productId, quantity }),
  });

export const removeCartItem = (productId) =>
  apiRequest(`/api/cart/items/${productId}`, { method: 'DELETE' });

export const replaceCart = (items) =>
  apiRequest('/api/cart', {
    method: 'PUT',
    body: JSON.stringify({
      items: items.map(({ productId, quantity }) => ({ productId, quantity })),
    }),
  });

export const clearCartRequest = () =>
  apiRequest('/api/cart', { method: 'DELETE' });
