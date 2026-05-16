import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, LoginPayload, RegisterPayload } from '../api/auth.api';

interface AuthState {
  token: string | null;
  email: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  /**
   * Restore token from SecureStore on app launch
   */
  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const email = await SecureStore.getItemAsync('userEmail');
      if (token) {
        set({ token, email, isAuthenticated: true });
      }
    } catch (e) {
      // Token not found or expired
      set({ token: null, isAuthenticated: false });
    }
  },

  /**
   * POST /api/v1/auth/login
   */
  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(payload);
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('userEmail', data.email);
      set({
        token: data.accessToken,
        email: data.email,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e: any) {
      const message =
        e?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  /**
   * POST /api/v1/auth/register
   */
  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(payload);
      set({ isLoading: false });
    } catch (e: any) {
      const message =
        e?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  /**
   * Clear token and navigate to login
   */
  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('userEmail');
    set({ token: null, email: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
