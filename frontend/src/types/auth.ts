/**
 * Authentication related types
 */

export interface User {
  id: number;
  username: string;
  email: string;
  is_active: boolean;
  is_superuser: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: User;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirm_password: string;
}

export interface AccessKey {
  id: number;
  name: string;
  description?: string;
  key_value: string;
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface AccessKeyListItem {
  id: number;
  name: string;
  description?: string;
  is_active: boolean;
  expires_at?: string;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
  key_preview: string;
}

export interface AccessKeyCreate {
  name: string;
  description?: string;
  expires_at?: string;
}

export interface AccessKeyUpdate {
  name?: string;
  description?: string;
  expires_at?: string;
  is_active?: boolean;
}

export interface AccessKeyStats {
  total_keys: number;
  active_keys: number;
  expired_keys: number;
  unused_keys: number;
}