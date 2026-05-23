import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/storage';

export type VerificationProfile = {
  fullName: string;
  phoneNumber: string;
  citizenId: string;
  driverLicenseNumber: string;
  citizenIdFrontImageUri: string;
  citizenIdBackImageUri: string;
  driverLicenseImageUri: string;
};

type VerificationProfileDraft = Partial<VerificationProfile>;

interface ProfileState {
  profilesByEmail: Record<string, VerificationProfileDraft>;
  isLoading: boolean;
  restoreProfiles: () => Promise<void>;
  getProfile: (email: string | null) => VerificationProfileDraft;
  saveProfile: (email: string, profile: VerificationProfileDraft) => Promise<void>;
  isVerificationComplete: (email: string | null) => boolean;
}

const emptyProfile: VerificationProfileDraft = {};

const requiredFields: Array<keyof VerificationProfile> = [
  'fullName',
  'phoneNumber',
  'citizenId',
  'driverLicenseNumber',
  'citizenIdFrontImageUri',
  'citizenIdBackImageUri',
  'driverLicenseImageUri',
];

const normalize = (value?: string) => value?.trim() ?? '';

const isCompleteProfile = (profile: VerificationProfileDraft) =>
  requiredFields.every((field) => normalize(profile[field]));

export const useProfileStore = create<ProfileState>((set, get) => ({
  profilesByEmail: {},
  isLoading: false,

  restoreProfiles: async () => {
    set({ isLoading: true });
    try {
      const raw = await SecureStore.getItemAsync(STORAGE_KEYS.userVerificationProfile);
      set({ profilesByEmail: raw ? JSON.parse(raw) : {}, isLoading: false });
    } catch {
      set({ profilesByEmail: {}, isLoading: false });
    }
  },

  getProfile: (email) => {
    if (!email) return emptyProfile;
    return get().profilesByEmail[email] ?? emptyProfile;
  },

  saveProfile: async (email, profile) => {
    const nextProfiles = {
      ...get().profilesByEmail,
      [email]: {
        ...get().profilesByEmail[email],
        ...profile,
      },
    };

    await SecureStore.setItemAsync(
      STORAGE_KEYS.userVerificationProfile,
      JSON.stringify(nextProfiles)
    );
    set({ profilesByEmail: nextProfiles });
  },

  isVerificationComplete: (email) => {
    if (!email) return false;
    return isCompleteProfile(get().profilesByEmail[email] ?? emptyProfile);
  },
}));
