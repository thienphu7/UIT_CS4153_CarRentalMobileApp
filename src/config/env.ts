declare const process: {
  env?: {
    EXPO_PUBLIC_API_URL?: string;
  };
};

const requireEnv = (key: 'EXPO_PUBLIC_API_URL') => {
  const value = process.env?.[key]?.trim();

  if (!value) {
    throw new Error(
      `Missing ${key}. Create a .env file in UIT_CS4153_CarRentalMobileApp and set ${key}.`
    );
  }

  return value.replace(/\/+$/, '');
};

/**
 * Central runtime configuration for the mobile client.
 *
 * Expo exposes public env vars through the EXPO_PUBLIC_* prefix. Keep
 * machine-specific values in .env, which is intentionally gitignored.
 */
export const Env = {
  apiBaseUrl: requireEnv('EXPO_PUBLIC_API_URL'),
};
