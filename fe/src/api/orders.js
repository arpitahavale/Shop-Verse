import { apiRequest } from './client';

export const fetchOrders = () => apiRequest('/api/orders');

export const placeOrderRequest = (total) =>
  apiRequest('/api/orders', {
    method: 'POST',
    body: JSON.stringify({ total }),
  });
