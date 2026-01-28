import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { ApiResponse, ApiError, QueryParams } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Create axios instance
export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('aep_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiError>) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('aep_token');
      localStorage.removeItem('aep_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Build query string from params
function buildQueryString(params?: QueryParams): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : '';
}

// ============================================
// AUTH ENDPOINTS
// ============================================

export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: { email: string; password: string; name: string; unit?: string }) =>
    api.post('/auth/register', data),

  getMe: () => api.get('/auth/me'),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),
};

// ============================================
// GENERIC CRUD FACTORY
// ============================================

function createCrudApi<T>(endpoint: string) {
  return {
    getAll: (params?: QueryParams) =>
      api.get<ApiResponse<T[]>>(`/${endpoint}${buildQueryString(params)}`),

    getById: (id: string) =>
      api.get<ApiResponse<T>>(`/${endpoint}/${id}`),

    create: (data: Partial<T>) =>
      api.post<ApiResponse<T>>(`/${endpoint}`, data),

    update: (id: string, data: Partial<T>) =>
      api.put<ApiResponse<T>>(`/${endpoint}/${id}`, data),

    delete: (id: string) =>
      api.delete(`/${endpoint}/${id}`),

    bulkDelete: (ids: string[]) =>
      api.post(`/${endpoint}/bulk`, { action: 'delete', ids }),
  };
}

// ============================================
// MODULE APIS
// ============================================

export const patroleApi = createCrudApi<any>('patrole');
export const wykroczeniaApi = createCrudApi<any>('wykroczenia');
export const wkrdApi = createCrudApi<any>('wkrd');
export const sankcjeApi = createCrudApi<any>('sankcje');
export const konwojeApi = createCrudApi<any>('konwoje');
export const spbApi = createCrudApi<any>('spb');
export const pilotazeApi = createCrudApi<any>('pilotaze');
export const zdarzeniaApi = createCrudApi<any>('zdarzenia');
export const kalendarzApi = createCrudApi<any>('kalendarz');
export const mapApi = createCrudApi<any>('map');

// ============================================
// DASHBOARD API
// ============================================

export const dashboardApi = {
  getStats: (params?: { dateFrom?: string; dateTo?: string }) =>
    api.get('/dashboard/stats', { params }),

  getRecent: (limit?: number) =>
    api.get('/dashboard/recent', { params: { limit } }),

  getCharts: (period?: number) =>
    api.get('/dashboard/charts', { params: { period } }),
};

export default api;
