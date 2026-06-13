import { api } from './api'
import type {
  AuthResponse,
  ChangePasswordPayload,
  ChangePasswordResponse,
  LoginPayload,
  MeResponse,
  RegisterPayload,
  RegisterResponse,
  UpdateProfilePayload,
  UpdateProfileResponse,
} from '../types/auth'

export async function register(payload: RegisterPayload) {
  const response = await api.post<RegisterResponse>('/auth/register', payload)
  return response.data
}

export async function login(payload: LoginPayload) {
  const response = await api.post<AuthResponse>('/auth/login', payload)
  return response.data
}

export async function getMe() {
  const response = await api.get<MeResponse>('/auth/me')
  return response.data
}

export async function updateProfile(payload: UpdateProfilePayload) {
  const response = await api.patch<UpdateProfileResponse>('/auth/profile', payload)
  return response.data
}

export async function changePassword(payload: ChangePasswordPayload) {
  const response = await api.patch<ChangePasswordResponse>('/auth/password', payload)
  return response.data
}
