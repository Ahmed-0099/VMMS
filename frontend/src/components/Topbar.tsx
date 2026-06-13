import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { RoleName } from '../types/auth'

const roleLabels: Record<RoleName, string> = {
  ADMIN: 'Fleet Manager',
  TECHNICIAN: 'Technician',
  DRIVER: 'Driver',
}

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/vehicles': 'Vehicles',
  '/drivers': 'Drivers',
  '/assignments': 'Assignments',
  '/maintenance-schedules': 'Maintenance',
  '/work-orders': 'Work Orders',
  '/fault-reports': 'Fault Reports',
  '/fuel-logs': 'Fuel Logs',
  '/compliance-documents': 'Documents',
  '/reports': 'Reports',
  '/settings': 'Settings',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function Topbar() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const pageTitle = pageTitles[location.pathname] ?? 'VMMS'

  const initials = useMemo(() => (user ? getInitials(user.name) : 'U'), [user])

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <header className="topbar">
      <div>
        <div className="topbar-eyebrow">Vehicle Maintenance Management</div>
        <h1 className="topbar-title">{pageTitle}</h1>
      </div>

      <div className="topbar-user">
        <div className="user-avatar" aria-hidden="true">
          {initials}
        </div>
        <div className="topbar-user-meta">
          <div className="topbar-user-name">{user?.name}</div>
          <span className="role-badge">{user ? roleLabels[user.role] : 'User'}</span>
        </div>
        <button type="button" className="btn btn-outline-danger btn-sm topbar-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  )
}
