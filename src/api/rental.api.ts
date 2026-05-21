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
  // Current BE UpdateRentalDto does not persist this yet, but older customer UI
  // sends it when requesting cancellation. Keep typed so the API failure/success
  // is surfaced from the real endpoint rather than handled as local mock state.
  rentalStatus?: RentalStatus;
  pickUpAt?: string;
  dropOffAt?: string;
  pickUpLocation?: string;
  dropOffLocation?: string;
}

export const rentalApi = {
  /** POST /rentals - customer creates a pending booking. */
  createRental: (data: CreateRentalPayload) => apiClient.post<Rental>('/rentals', data),

  /** GET /rentals - customer reads their own bookings from JWT sub. */
  fetchMyRentals: async () => {
    const { data } = await apiClient.get<Rental[] | PaginatedResponse<Rental>>('/rentals');
    return unwrapCollection(data);
  },

  /** PATCH /rentals/:id - customer update route in current BE. */
  updateRental: (id: string, data: UpdateRentalPayload) => apiClient.patch<Rental>(`/rentals/${id}`, data),

  /** GET /admin/rentals - employee reads all bookings. */
  fetchAdminRentals: async () => {
    const { data } = await apiClient.get<Rental[] | PaginatedResponse<Rental>>('/admin/rentals');
    return unwrapCollection(data);
  },

  /** POST /admin/rentals - employee books a car for a customer email. */
  createRentalByEmployee: (data: EmployeeCreateRentalPayload) =>
    apiClient.post<Rental>('/admin/rentals', data),

  /**
   * PATCH /admin/rentals/:id - intended employee status workflow.
   * The inspected backend currently has duplicate PATCH handlers, so this call
   * may fail until those routes are split server-side. The FE still calls the
   * real API and surfaces the backend response instead of faking a status.
   */
  requestAdminStatusChange: (id: string, rentalStatus: RentalStatus) =>
    apiClient.patch<Rental>(`/admin/rentals/${id}`, { rentalStatus }),

  /** PATCH /admin/rentals/:id - employee updates editable timing fields. */
  updateRentalByEmployee: (id: string, data: UpdateRentalPayload) =>
    apiClient.patch<Rental>(`/admin/rentals/${id}`, data),
};
