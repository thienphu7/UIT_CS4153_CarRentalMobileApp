import { apiClient, PaginatedResponse, unwrapCollection } from './client';
import { Car } from './car.api';

export type RentalStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface RentalCustomer {
  id: string;
  fullName?: string;
  phone?: string;
  address?: string;
  driverLicense?: string;
}

export interface Rental {
  id: string;
  carId: string;
  customerId: string;
  employeeId?: string | null;
  rentalStatus: RentalStatus;
  pickUpAt: string;
  dropOffAt: string;
  /**
   * Current RentalResponseDto declares these fields but does not assign them.
   * Keep them optional so screens can render safe fallbacks until BE is fixed.
   */
  pickUpLocation?: string;
  dropOffLocation?: string;
  totalAmount?: number;
  createdAt: string;
  updatedAt: string;
  car?: Car;
  customer?: RentalCustomer;
}

export interface CreateRentalPayload {
  carId: string;
  pickUpAt: string;
  dropOffAt: string;
  pickUpLocation: string;
  dropOffLocation: string;
}

export interface EmployeeCreateRentalPayload extends CreateRentalPayload {
  customerEmail: string;
}

export interface UpdateRentalPayload {
  pickUpAt?: string;
  dropOffAt?: string;
  pickUpLocation?: string;
  dropOffLocation?: string;
}

const DEFAULT_RENTAL_LIMIT = 100;

const getTotalPages = <T>(payload: T[] | PaginatedResponse<T>) => {
  if (Array.isArray(payload)) return 1;
  return payload.totalPage ?? payload.meta?.totalPages ?? 1;
};

export const rentalApi = {
  /** POST /rentals - customer creates a pending booking. */
  createRental: (data: CreateRentalPayload) => apiClient.post<Rental>('/rentals', data),

  /** GET /rentals - customer reads their own bookings from JWT sub. */
  fetchMyRentals: async () => {
    const { data } = await apiClient.get<Rental[] | PaginatedResponse<Rental>>('/rentals', {
      params: { limit: DEFAULT_RENTAL_LIMIT },
    });
    const rentals = unwrapCollection(data);
    if (Array.isArray(data)) return rentals;

    const totalPages = getTotalPages(data);
    const currentPage = data.page ?? data.meta?.page ?? 1;
    if (totalPages <= currentPage) return rentals;

    const remainingPages = Array.from(
      { length: totalPages - currentPage },
      (_, index) => currentPage + index + 1
    );
    const pages = await Promise.all(
      remainingPages.map((page) =>
        apiClient.get<Rental[] | PaginatedResponse<Rental>>('/rentals', {
          params: { limit: DEFAULT_RENTAL_LIMIT, page },
        })
      )
    );

    return rentals.concat(pages.flatMap((response) => unwrapCollection(response.data)));
  },

  /** PATCH /rentals/:id - customer update route in current BE. */
  updateRental: (id: string, data: UpdateRentalPayload) => apiClient.patch<Rental>(`/rentals/${id}`, data),

  /** PATCH /rentals/:id/cancel - customer cancels a pending/approved booking. */
  cancelRental: (id: string) => apiClient.patch<Rental>(`/rentals/${id}/cancel`, {}),

  /** GET /admin/rentals - employee reads all bookings. */
  fetchAdminRentals: async () => {
    const { data } = await apiClient.get<Rental[] | PaginatedResponse<Rental>>('/admin/rentals', {
      params: { limit: DEFAULT_RENTAL_LIMIT },
    });
    const rentals = unwrapCollection(data);
    if (Array.isArray(data)) return rentals;

    const totalPages = getTotalPages(data);
    const currentPage = data.page ?? data.meta?.page ?? 1;
    if (totalPages <= currentPage) return rentals;

    const remainingPages = Array.from(
      { length: totalPages - currentPage },
      (_, index) => currentPage + index + 1
    );
    const pages = await Promise.all(
      remainingPages.map((page) =>
        apiClient.get<Rental[] | PaginatedResponse<Rental>>('/admin/rentals', {
          params: { limit: DEFAULT_RENTAL_LIMIT, page },
        })
      )
    );

    return rentals.concat(pages.flatMap((response) => unwrapCollection(response.data)));
  },

  /** POST /admin/rentals - employee books a car for a customer email. */
  createRentalByEmployee: (data: EmployeeCreateRentalPayload) =>
    apiClient.post<Rental>('/admin/rentals', data),

  /** PATCH /admin/rentals/:id/:action - employee status workflow. */
  requestAdminStatusChange: (id: string, rentalStatus: RentalStatus) => {
    if (rentalStatus === 'APPROVED') return apiClient.patch<Rental>(`/admin/rentals/${id}/approve`, {});
    if (rentalStatus === 'REJECTED') return apiClient.patch<Rental>(`/admin/rentals/${id}/reject`, {});
    if (rentalStatus === 'CANCELLED') return apiClient.patch<Rental>(`/admin/rentals/${id}/cancel`, {});
    return apiClient.patch<Rental>(`/admin/rentals/${id}`, { rentalStatus });
  },

  /** PATCH /admin/rentals/:id - employee updates editable timing fields. */
  updateRentalByEmployee: (id: string, data: UpdateRentalPayload) =>
    apiClient.patch<Rental>(`/admin/rentals/${id}`, data),
};
