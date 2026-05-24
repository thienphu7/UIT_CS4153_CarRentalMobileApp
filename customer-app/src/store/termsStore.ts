import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/storage';

type TermsAcceptance = {
  accepted: boolean;
  acceptedAt?: string;
  version?: string;
};

interface TermsState {
  acceptancesByUser: Record<string, TermsAcceptance>;
  isLoading: boolean;
  restoreTermsAcceptances: () => Promise<void>;
  getAcceptance: (userKey: string | null) => TermsAcceptance;
  acceptTerms: (userKey: string, version: string) => Promise<void>;
}

const guestKey = 'guest';
const emptyAcceptance: TermsAcceptance = { accepted: false };

const resolveKey = (userKey: string | null) => userKey || guestKey;

export const useTermsStore = create<TermsState>((set, get) => ({
  acceptancesByUser: {},
  isLoading: false,

  restoreTermsAcceptances: async () => {
    set({ isLoading: true });
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEYS.termsAcceptance);
      set({ acceptancesByUser: raw ? JSON.parse(raw) : {}, isLoading: false });
    } catch {
      set({ acceptancesByUser: {}, isLoading: false });
    }
  },

  getAcceptance: (userKey) => {
    return get().acceptancesByUser[resolveKey(userKey)] ?? emptyAcceptance;
  },

  acceptTerms: async (userKey, version) => {
    const key = resolveKey(userKey);
    const nextAcceptances = {
      ...get().acceptancesByUser,
      [key]: {
        accepted: true,
        acceptedAt: new Date().toISOString(),
        version,
      },
    };

    await SecureStore.setItemAsync(
      STORAGE_KEYS.termsAcceptance,
      JSON.stringify(nextAcceptances)
    );
    set({ acceptancesByUser: nextAcceptances });
  },
}));
