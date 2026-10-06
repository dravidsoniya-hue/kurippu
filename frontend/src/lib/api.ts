import axios from 'axios';

// In production (Vercel/Render), frontend & backend share the same domain via rewrites.
// Relative baseURL means axios calls /api/... which routes to the backend automatically.
// In local dev, fall back to localhost:8000 (Vite proxy also handles this).
export const getApiBase = (): string => {
  const custom = typeof window !== 'undefined' ? localStorage.getItem('kurippu_api_url') : null;
  if (custom && custom.trim() !== '') return custom.trim().replace(/\/+$/, '');

  const envUrl = import.meta.env.VITE_API_URL;
  if (envUrl && envUrl.trim() !== '') return envUrl.trim().replace(/\/+$/, '');

  if (import.meta.env.DEV) return 'http://localhost:8000';

  return '';
};

export const setApiBase = (url: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('kurippu_api_url', url.trim().replace(/\/+$/, ''));
    api.defaults.baseURL = url.trim().replace(/\/+$/, '');
  }
};

const api = axios.create({
  baseURL: getApiBase(),
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token & latest baseURL to every request
api.interceptors.request.use((config) => {
  const currentBase = getApiBase();
  if (currentBase) {
    config.baseURL = currentBase;
  }
  const token = localStorage.getItem('kurippu_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('kurippu_token');
      localStorage.removeItem('kurippu_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { name: string; email: string; password: string; confirm_password: string }) =>
    api.post('/api/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/api/auth/login', data),
  demoLogin: () => api.post('/api/auth/demo-login'),
  me: () => api.get('/api/auth/me'),
  logout: () => api.post('/api/auth/logout'),
};

// ── Documents ─────────────────────────────────────────────────────────────────
export const documentsApi = {
  upload: (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post('/api/documents/upload', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  list: (params?: { page?: number; page_size?: number; search?: string }) =>
    api.get('/api/documents', { params }),
  get: (id: string) => api.get(`/api/documents/${id}`),
  getExtractions: (id: string) => api.get(`/api/documents/${id}/extractions`),
  getTimeline: (id: string) => api.get(`/api/documents/${id}/timeline`),
  delete: (id: string) => api.delete(`/api/documents/${id}`),
};

// ── Actions ───────────────────────────────────────────────────────────────────
export const actionsApi = {
  bulkConfirm: (data: { document_id: string; actions: any[] }) =>
    api.post('/api/actions/bulk-confirm', data),
  create: (data: any) => api.post('/api/actions', data),
  list: (params?: { status_filter?: string; priority_filter?: string; search?: string }) =>
    api.get('/api/actions', { params }),
  why: (id: string) => api.get(`/api/actions/${id}/why`),
  update: (id: string, data: any) => api.patch(`/api/actions/${id}`, data),
  delete: (id: string) => api.delete(`/api/actions/${id}`),
};

// ── Events ────────────────────────────────────────────────────────────────────
export const eventsApi = {
  list: () => api.get('/api/events'),
  create: (data: any) => api.post('/api/events', data),
  delete: (id: string) => api.delete(`/api/events/${id}`),
};

// ── Reminders ─────────────────────────────────────────────────────────────────
export const remindersApi = {
  list: () => api.get('/api/reminders'),
  create: (data: any) => api.post('/api/reminders', data),
  delete: (id: string) => api.delete(`/api/reminders/${id}`),
};

// ── Search ────────────────────────────────────────────────────────────────────
export const searchApi = {
  search: (q: string) => api.get('/api/search', { params: { q } }),
};

// ── Analytics ─────────────────────────────────────────────────────────────────
export const analyticsApi = {
  get: () => api.get('/api/analytics'),
};

// ── Users ─────────────────────────────────────────────────────────────────────
export const usersApi = {
  getProfile: () => api.get('/api/users/profile'),
  updateProfile: (data: any) => api.patch('/api/users/profile', data),
  getNotifications: () => api.get('/api/users/notifications'),
  markRead: (id: string) => api.patch(`/api/users/notifications/${id}/read`),
  getAuditLogs: () => api.get('/api/users/audit-logs'),
  exportData: () => api.post('/api/users/export'),
  deleteAccount: () => api.delete('/api/users/account'),
};

export default api;
