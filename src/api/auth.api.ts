import { apiClient } from './client';

export type UserRole = 'CUSTOMER' | 'EMPLOYEE';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  address: string;
  driverLicense: string;
  dateOfBirth?: string | null;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  email: string;
}

export interface RegisterResponse {
  email: string;
  fullName: string;
  phone: string;
  address: string;
  driverLicense: string;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  exp?: number;
  iat?: number;
}

// Login DTO does not include role in the JSON response, but BE signs it into
// the JWT payload. Decoding here lets navigation separate Customer/Admin flows.
export const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    const json = decodeURIComponent(
      decoded
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
};

export const authApi = {
  /** POST /auth/login - public endpoint returning the JWT access token. */
  login: (data: LoginPayload) => apiClient.post<LoginResponse>('/auth/login', data),

  /** POST /auth/register - public endpoint creating a customer account. */
  register: (data: RegisterPayload) => apiClient.post<RegisterResponse>('/auth/register', data),
};
