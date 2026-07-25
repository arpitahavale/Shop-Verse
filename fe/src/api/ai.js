import { apiRequest } from './client';

export const fetchAiStatus = () => apiRequest('/api/ai/status');

export const recommendProducts = (query, limit = 4) =>
  apiRequest('/api/ai/recommend', {
    method: 'POST',
    body: JSON.stringify({ query, limit }),
  });

export const chatWithAgent = (message, history = []) =>
  apiRequest('/api/ai/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
