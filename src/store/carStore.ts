import { create } from 'zustand';
import { carApi, Car, QueryCarsParams } from '../api/car.api';
import { getApiErrorMessage } from '../utils/apiError';

interface CarState {
  cars: Car[];
  selectedCar: Car | null;
  filters: QueryCarsParams;
  isLoading: boolean;
  error: string | null;
  fetchCars: (params?: QueryCarsParams) => Promise<void>;
  fetchCarById: (id: string) => Promise<void>;
  setFilters: (filters: QueryCarsParams) => void;
  clearFilters: () => void;
}

export const useCarStore = create<CarState>((set, get) => ({
  cars: [],
  selectedCar: null,
  filters: {},
  isLoading: false,
  error: null,

  // GET /cars with optional filters from QueryCarDto.
  fetchCars: async (params?: QueryCarsParams) => {
    set({ isLoading: true, error: null });
    try {
      const data = await carApi.fetchCars(params ?? get().filters);
      set({ cars: data, isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error, 'Không thể tải danh sách xe'), isLoading: false });
    }
  },

  // GET /cars/:id and keep a single selected car for detail/booking screens.
  fetchCarById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await carApi.fetchCarById(id);
      set({ selectedCar: data, isLoading: false });
    } catch (error) {
      set({ error: getApiErrorMessage(error, 'Không thể tải thông tin xe'), isLoading: false });
    }
  },

  setFilters: (filters: QueryCarsParams) => set({ filters }),
  clearFilters: () => set({ filters: {} }),
}));
