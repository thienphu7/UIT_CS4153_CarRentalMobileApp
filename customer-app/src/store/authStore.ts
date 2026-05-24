import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import {
  authApi,
  decodeJwtPayload,
  isJwtExpired,
  LoginPayload,
  RegisterPayload,
  UserRole,
} from '../api/auth.api';
import { STORAGE_KEYS } from '../constants/storage';
import { getApiErrorMessage } from '../utils/apiError';

interface AuthState {
  token: string | null;
  email: string | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  restoreToken: () => Promise<void>;
  clearError: () => void;
}

const clearAuthStorage = async () => {
  await Promise.all([
    SecureStore.deleteItemAsync(STORAGE_KEYS.accessToken),
    SecureStore.deleteItemAsync(STORAGE_KEYS.userEmail),
    SecureStore.deleteItemAsync(STORAGE_KEYS.userRole),
  ]);
};

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Restore persisted login and drop expired JWTs before navigation renders.
  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync(STORAGE_KEYS.accessToken);
      const email = await SecureStore.getItemAsync(STORAGE_KEYS.userEmail);
      const role = (await SecureStore.getItemAsync(STORAGE_KEYS.userRole)) as UserRole | null;

      if (token && isJwtExpired(token)) {
        await clearAuthStorage();
        set({ token: null, email: null, role: null, isAuthenticated: false });
        return;
      }

      if (token) {
        set({ token, email, role, isAuthenticated: true });
      }
    } catch {
      set({ token: null, email: null, role: null, isAuthenticated: false });
    }
  },

  // POST /auth/login, then derive role from the JWT payload signed by BE.
  login: async (payload: LoginPayload) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await authApi.login(payload);
      const jwtPayload = decodeJwtPayload(data.accessToken);
      const role = jwtPayload?.role ?? 'CUSTOMER';

      await Promise.all([
        SecureStore.setItemAsync(STORAGE_KEYS.accessToken, data.accessToken),
        SecureStore.setItemAsync(STORAGE_KEYS.userEmail, data.email),
        SecureStore.setItemAsync(STORAGE_KEYS.userRole, role),
      ]);

      set({
        token: data.accessToken,
        email: data.email,
        role,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      await clearAuthStorage();
      set({
        token: null,
        email: null,
        role: null,
        isAuthenticated: false,
        error: getApiErrorMessage(error, 'Đăng nhập thất bại. Vui lòng thử lại.'),
        isLoading: false,
      });
      throw error;
    }
  },

  // POST /auth/register creates a CUSTOMER account in the current BE.
  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(payload);
      await clearAuthStorage();
      set({
        token: null,
        email: null,
        role: null,
        isAuthenticated: false,
        isLoading: false,
      });
    } catch (error) {
      set({
        error: getApiErrorMessage(error, 'Đăng ký thất bại. Vui lòng thử lại.'),
        isLoading: false,
      });
      throw error;
    }
  },

  logout: async () => {
    await clearAuthStorage();
    set({ token: null, email: null, role: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
