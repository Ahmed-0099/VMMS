export type RoleName = 'ADMIN' | 'TECHNICIAN' | 'DRIVER'

export type UserStatus = 'ACTIVE' | 'INACTIVE'

export type AuthUser = {
  id: string
  name: string
  email: string
  status: UserStatus
  role: RoleName
}

export type LoginPayload = {
  email: string
  password: string
}

export type RegisterPayload = {
  name: string
  email: string
  password: string
  roleName: RoleName
}

export type UpdateProfilePayload = {
  name: string
}

export type ChangePasswordPayload = {
  currentPassword: string
  newPassword: string
}

export type AuthResponse = {
  message: string
  token: string
  user: AuthUser
}

export type RegisterResponse = {
  message: string
  user: AuthUser
}

export type MeResponse = {
  user: AuthUser
}

export type UpdateProfileResponse = {
  message: string
  user: AuthUser
}

export type ChangePasswordResponse = {
  message: string
}
