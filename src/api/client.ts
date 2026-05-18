import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Android emulator uses 10.0.2.2 to reach the host machine.
// iOS simulator and web can call localhost directly.
const BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';

export interface PaginatedResponse<T> {
  data: T[];
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
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Clear local auth state; AppNavigator reacts on next store restore/login.
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('userEmail');
      await SecureStore.deleteItemAsync('userRole');
    }
    return Promise.reject(error);
  }
);
