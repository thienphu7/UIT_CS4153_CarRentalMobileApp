import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, decodeJwtPayload, LoginPayload, RegisterPayload, UserRole } from '../api/auth.api';

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

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  role: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  // Restore persisted login so the app can open directly into the right role.
  restoreToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      const email = await SecureStore.getItemAsync('userEmail');
      const role = (await SecureStore.getItemAsync('userRole')) as UserRole | null;
      if (token) set({ token, email, role, isAuthenticated: true });
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
      await SecureStore.setItemAsync('accessToken', data.accessToken);
      await SecureStore.setItemAsync('userEmail', data.email);
      await SecureStore.setItemAsync('userRole', role);
      set({
        token: data.accessToken,
        email: data.email,
        role,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  // POST /auth/register creates a CUSTOMER account in the current BE.
  register: async (payload: RegisterPayload) => {
    set({ isLoading: true, error: null });
    try {
      await authApi.register(payload);
      set({ isLoading: false });
    } catch (e: any) {
      const message = e?.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
      set({ error: message, isLoading: false });
      throw e;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('userEmail');
    await SecureStore.deleteItemAsync('userRole');
    set({ token: null, email: null, role: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
