import { apiRequest } from './client';

export const loginRequest = (email, password) =>
  apiRequest('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

export const registerRequest = (name, email, password) =>
  apiRequest('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

export const fetchMe = () => apiRequest('/api/auth/me');

export const updateVibeRequest = (activeVibe) =>
  apiRequest('/api/auth/me/vibe', {
    method: 'PATCH',
    body: JSON.stringify({ activeVibe }),
  });
