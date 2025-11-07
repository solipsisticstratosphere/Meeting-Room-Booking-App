import { apiClient } from './client';
import type { AuthResponse, LoginCredentials, RegisterCredentials, User } from '../types';

export const authApi = {
  register: async (data: RegisterCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data);
    return response.data;
  },

  login: async (data: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data);
    return response.data;
  },

  getMe: async (): Promise<{ user: User }> => {
    const response = await apiClient.get<{ user: User }>('/auth/me');
    return response.data;
  },
};
