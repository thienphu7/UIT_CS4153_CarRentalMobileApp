import { apiClient } from './client';

export interface CustomerProfileResponse {
  id: string;
  userId: string;
  email?: string;
  fullName: string;
  phone: string;
  address: string;
  identityNum: string;
  driverLicense: string;
  dateOfBirth: string | null;
}

export const customerApi = {
  getMe: () => apiClient.get<CustomerProfileResponse>('/customers/me'),
};
