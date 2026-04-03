/**
 * API service – centralised HTTP calls to the backend.
 * Adds the x-shop-id header automatically.
 */
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '/api';

// In a real Shopify app this comes from the session token.
const SHOP_ID = process.env.REACT_APP_SHOP_ID || 'demo-store.myshopify.com';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'x-shop-id': SHOP_ID },
});

/** Timer CRUD */
export const fetchTimers = () => api.get('/timers').then((r) => r.data.data);
export const fetchTimer = (id) => api.get(`/timers/${id}`).then((r) => r.data.data);
export const createTimer = (data) => api.post('/timers', data).then((r) => r.data.data);
export const updateTimer = (id, data) => api.put(`/timers/${id}`, data).then((r) => r.data.data);
export const deleteTimer = (id) => api.delete(`/timers/${id}`);

/** Analytics (public) */
export const fetchActiveTimers = (shopId, productId) =>
  api.get('/analytics/active-timers', { params: { shopId, productId } }).then((r) => r.data.data);
export const trackImpression = (timerId) =>
  api.post(`/analytics/impression/${timerId}`);

export default api;
