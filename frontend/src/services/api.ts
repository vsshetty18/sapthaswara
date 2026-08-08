import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const TOKEN_KEY = 'svaraverse_access_token';
const REFRESH_KEY = 'svaraverse_refresh_token';

let inMemoryAccessToken: string | null = null;
let inMemoryRefreshToken: string | null = null;

export const tokenStore = {
  getAccessToken: (): string | null => {
    if (inMemoryAccessToken) return inMemoryAccessToken;
    if (typeof window !== 'undefined') {
      inMemoryAccessToken = window.sessionStorage.getItem(TOKEN_KEY);
    }
    return inMemoryAccessToken;
  },
  getRefreshToken: (): string | null => {
    if (inMemoryRefreshToken) return inMemoryRefreshToken;
    if (typeof window !== 'undefined') {
      inMemoryRefreshToken = window.sessionStorage.getItem(REFRESH_KEY);
    }
    return inMemoryRefreshToken;
  },
  setTokens: (accessToken: string, refreshToken: string) => {
    inMemoryAccessToken = accessToken;
    inMemoryRefreshToken = refreshToken;
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem(TOKEN_KEY, accessToken);
      window.sessionStorage.setItem(REFRESH_KEY, refreshToken);
    }
  },
  clearTokens: () => {
    inMemoryAccessToken = null;
    inMemoryRefreshToken = null;
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(TOKEN_KEY);
      window.sessionStorage.removeItem(REFRESH_KEY);
    }
  },
};

const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = tokenStore.getAccessToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const processQueue = (token: string | null) => {
  refreshQueue.forEach((callback) => callback(token));
  refreshQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = tokenStore.getRefreshToken();
      if (!refreshToken) {
        tokenStore.clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((token) => {
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${API_BASE_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = data.data;
        tokenStore.setTokens(accessToken, newRefreshToken);
        processQueue(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(null);
        tokenStore.clearTokens();
        if (typeof window !== 'undefined') window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: { field: string; message: string }[];
}

export const apiClient = {
  get: async <T = unknown>(url: string, params?: Record<string, any>): Promise<ApiResponse<T>> => {
    const { data } = await api.get(url, { params });
    return data;
  },
  post: async <T = unknown>(url: string, body?: Record<string, any>): Promise<ApiResponse<T>> => {
    const { data } = await api.post(url, body);
    return data;
  },
  patch: async <T = unknown>(url: string, body?: Record<string, any>): Promise<ApiResponse<T>> => {
    const { data } = await api.patch(url, body);
    return data;
  },
  delete: async <T = unknown>(url: string): Promise<ApiResponse<T>> => {
    const { data } = await api.delete(url);
    return data;
  },
  upload: async <T = unknown>(url: string, formData: FormData): Promise<ApiResponse<T>> => {
    const { data } = await api.post(url, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};

export default api;
