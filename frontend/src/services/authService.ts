import { api } from './api'
import type { AuthResponse, LoginPayload, MeResponse, RegisterPayload, RegisterResponse } from '../types/auth'

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
