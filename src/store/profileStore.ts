import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { STORAGE_KEYS } from '../constants/storage';
import { customerApi } from '../api/customer.api';

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
  syncCurrentCustomer: (email: string | null) => Promise<void>;
  getProfile: (email: string | null) => VerificationProfileDraft;
  saveProfile: (email: string, profile: VerificationProfileDraft) => Promise<void>;
  isVerificationComplete: (email: string | null) => boolean;
  isDocumentImagesComplete: (email: string | null) => boolean;
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

const documentImageFields: Array<keyof VerificationProfile> = [
  'citizenIdFrontImageUri',
  'citizenIdBackImageUri',
  'driverLicenseImageUri',
];

const isCompleteDocumentImages = (profile: VerificationProfileDraft) =>
  documentImageFields.every((field) => normalize(profile[field]));

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

  syncCurrentCustomer: async (email) => {
    if (!email) return;

    try {
      const { data } = await customerApi.getMe();
      const current = get().profilesByEmail[email] ?? emptyProfile;
      await get().saveProfile(email, {
        ...current,
        fullName: data.fullName || current.fullName,
        phoneNumber: data.phone || current.phoneNumber,
        citizenId: data.identityNum || current.citizenId,
        driverLicenseNumber: data.driverLicense || current.driverLicenseNumber,
      });
    } catch {
      // Keep local verification data available even when the profile endpoint
      // cannot be reached, for example while developing offline.
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

  isDocumentImagesComplete: (email) => {
    if (!email) return false;
    return isCompleteDocumentImages(get().profilesByEmail[email] ?? emptyProfile);
  },
}));
