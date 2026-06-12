import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'
import type { RoleName } from '../types/auth'

type RoleGuardProps = {
  allowedRoles: RoleName[]
  children: ReactNode
  fallback?: ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { user } = useAuth()

  if (!user || !allowedRoles.includes(user.role)) {
    return fallback
  }

  return children
}
