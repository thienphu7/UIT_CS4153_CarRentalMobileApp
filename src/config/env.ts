import { Platform } from 'react-native';

declare const process: {
  env?: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

const defaultApiUrl =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';

/**
 * Central runtime configuration for the mobile client.
 *
 * Expo exposes public env vars through the EXPO_PUBLIC_* prefix. Keeping the
 * fallback here preserves the current local backend setup while allowing CI,
 * staging, and production builds to point at different API hosts without code
 * changes.
 */
export const Env = {
  apiBaseUrl: process.env?.EXPO_PUBLIC_API_URL?.trim() || defaultApiUrl,
};
