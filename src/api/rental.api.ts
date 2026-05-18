import { apiClient, PaginatedResponse, unwrapCollection } from './client';
import { Car } from './car.api';

export type RentalStatus =
  | 'PENDING'
  | 'ACTIVE'
  | 'APPROVED'
  | 'REJECTED'
  | 'COMPLETED'
  | 'CANCELLED';

export interface Rental {
  id: string;
  carId: string;
  customerId: string;
  employeeId?: string | null;
  rentalStatus: RentalStatus;
  pickUpAt: string;
  dropOffAt: string;
  pickUpLocation: string;
  dropOffLocation: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  car?: Car;
  customer?: {
    id: string;
    fullName: string;
    phone: string;
    address: string;
    driverLicense: string;
  };
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
  // The service has status workflows, but the current controllers expose them
  // on duplicate PATCH routes. Keeping this optional field preserves existing
  // Customer UI calls while documenting that BE route work is still needed.
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

  /** PATCH /rentals/:id - customer update. */
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
   * PATCH /admin/rentals/:id - employee update.
   * Note: BE currently has duplicate PATCH ':id' handlers for approve/reject/cancel,
   * so only the first PATCH route is reliable until BE exposes distinct paths.
   */
  updateRentalByEmployee: (id: string, data: UpdateRentalPayload) =>
    apiClient.patch<Rental>(`/admin/rentals/${id}`, data),
};
