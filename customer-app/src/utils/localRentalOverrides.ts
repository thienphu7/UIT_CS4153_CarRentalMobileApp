import * as SecureStore from 'expo-secure-store';
import type { Rental } from '../api/rental.api';

const RENTAL_LOCATIONS_KEY = 'local_rental_locations';

type RentalLocationSnapshot = {
  pickUpLocation?: string;
  dropOffLocation?: string;
};

type RentalLocationMap = Record<string, RentalLocationSnapshot>;

const readRentalLocations = async (): Promise<RentalLocationMap> => {
  try {
    const raw = await SecureStore.getItemAsync(RENTAL_LOCATIONS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
};

export const saveRentalLocationsLocally = async (
  rentalId: string,
  locations: Required<RentalLocationSnapshot>
) => {
  const current = await readRentalLocations();
  await SecureStore.setItemAsync(
    RENTAL_LOCATIONS_KEY,
    JSON.stringify({
      ...current,
      [rentalId]: {
        pickUpLocation: locations.pickUpLocation,
        dropOffLocation: locations.dropOffLocation,
      },
    })
  );
};

const applyRentalLocationFallbacks = async (rentals: Rental[]) => {
  const locations = await readRentalLocations();
  return rentals.map((rental) => {
    const local = locations[rental.id];
    if (!local) return rental;

    return {
      ...rental,
      pickUpLocation: rental.pickUpLocation?.trim() || local.pickUpLocation,
      dropOffLocation: rental.dropOffLocation?.trim() || local.dropOffLocation,
    };
  });
};

export const getVisibleRentals = async (rentals: Rental[]) => {
  return applyRentalLocationFallbacks(rentals);
};
