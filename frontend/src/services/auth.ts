/**
 * Authentication API services
 */

import api from '@/lib/api';
import {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  AccessKey,
  AccessKeyListItem,
  AccessKeyCreate,
  AccessKeyUpdate,
  AccessKeyStats,
} from '@/types/auth';

export const authService = {
  // Authentication
  async login(data: LoginRequest): Promise<LoginResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async register(data: RegisterRequest): Promise<User> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  },

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },

  async refreshToken(refreshToken: string): Promise<{ access_token: string }> {
    const response = await api.post('/auth/refresh', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // User management
  async updateProfile(data: Partial<User>): Promise<User> {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  // Access Keys
  async getAccessKeys(): Promise<AccessKeyListItem[]> {
    const response = await api.get('/access-keys');
    return response.data;
  },

  async createAccessKey(data: AccessKeyCreate): Promise<AccessKey> {
    const response = await api.post('/access-keys', data);
    return response.data;
  },

  async getAccessKey(id: number): Promise<AccessKey> {
    const response = await api.get(`/access-keys/${id}`);
    return response.data;
  },

  async updateAccessKey(id: number, data: AccessKeyUpdate): Promise<AccessKey> {
    const response = await api.put(`/access-keys/${id}`, data);
    return response.data;
  },

  async deleteAccessKey(id: number): Promise<void> {
    await api.delete(`/access-keys/${id}`);
  },

  async toggleAccessKey(id: number): Promise<AccessKey> {
    const response = await api.post(`/access-keys/${id}/toggle`);
    return response.data;
  },

  async getAccessKeyStats(): Promise<AccessKeyStats> {
    const response = await api.get('/access-keys/stats');
    return response.data;
  },
};