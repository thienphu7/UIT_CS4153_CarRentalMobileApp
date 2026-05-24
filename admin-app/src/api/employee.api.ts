import { apiClient } from './client';

export interface EmployeeProfile {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  position: string;
  hireDate: string;
  createdAt: string;
  updatedAt: string;
}

export const employeeApi = {
  fetchMe: () => apiClient.get<EmployeeProfile>('/employees/me'),
};
