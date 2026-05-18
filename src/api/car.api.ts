import { apiClient, PaginatedResponse, unwrapCollection } from './client';

export type CarStatus = 'AVAILABLE' | 'RENTED' | 'MAINTENANCE' | 'DELETED';

export interface Car {
  id: string;
  brand: string;
  model: string;
  carType: string;
  color: string;
  licensePlate: string;
  manufactureYear: number;
  pricePerHour: number;
  capacity: number;
  mileage: number;
  status: CarStatus;
  description?: string | null;
  imagePath?: string | null;
  publicImageId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface QueryCarsParams {
  brand?: string;
  model?: string;
  carType?: string;
  color?: string;
  carStatus?: CarStatus;
  sortBy?: 'pricePerDay' | 'manufactureYear' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export type CreateCarPayload = Omit<Car, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateCarPayload = Partial<CreateCarPayload>;

export const carApi = {
  /** GET /cars - public list with filters matching QueryCarDto. */
  fetchCars: async (params?: QueryCarsParams) => {
    const { data } = await apiClient.get<Car[] | PaginatedResponse<Car>>('/cars', { params });
    return unwrapCollection(data);
  },

  /** GET /cars/:id - public car detail. */
  fetchCarById: (id: string) => apiClient.get<Car>(`/cars/${id}`),

  /** GET /cars/available?pickUpAt=&dropOffAt= - public availability lookup. */
  fetchAvailableCars: async (pickUpAt: string, dropOffAt: string) => {
    const { data } = await apiClient.get<Car[] | PaginatedResponse<Car>>('/cars/available', {
      params: { pickUpAt, dropOffAt },
    });
    return unwrapCollection(data);
  },

  /** POST /cars - employee only. */
  createCar: (data: CreateCarPayload) => apiClient.post<Car>('/cars', data),

  /** PATCH /cars/:id - employee only. */
  updateCar: (id: string, data: UpdateCarPayload) => apiClient.patch<Car>(`/cars/${id}`, data),

  /** DELETE /cars/:id - employee only, BE soft-deletes by marking DELETED. */
  deleteCar: (id: string) => apiClient.delete<Car>(`/cars/${id}`),
};
