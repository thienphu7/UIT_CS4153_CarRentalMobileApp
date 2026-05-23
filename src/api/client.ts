import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Env } from '../config/env';
import { STORAGE_KEYS } from '../constants/storage';
import { notifyAuthExpired } from '../store/authEvents';

export interface PaginatedResponse<T> {
  data: T[];
  page?: number;
  total?: number;
  totalPage?: number;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    totalPages?: number;
  };
}

// Some BE endpoints return a raw array, while repository-backed endpoints
// return { data, meta }. Screens should not have to care about that envelope.
export const unwrapCollection = <T>(payload: T[] | PaginatedResponse<T>): T[] =>
  Array.isArray(payload) ? payload : payload.data ?? [];

export const apiClient = axios.create({
  baseURL: Env.apiBaseUrl,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      await Promise.all([
        SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
        SecureStore.deleteItemAsync(STORAGE_KEYS.userEmail),
        SecureStore.deleteItemAsync(STORAGE_KEYS.userRole),
      ]);
      handleAuthError(status);
      notifyAuthExpired();
    }
    return Promise.reject(error);
  }
);
