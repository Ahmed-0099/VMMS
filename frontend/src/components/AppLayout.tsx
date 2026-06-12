import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import type { RoleName } from '../types/auth'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', roles: ['ADMIN', 'TECHNICIAN', 'DRIVER'] },
  { to: '/vehicles', label: 'Vehicles', roles: ['ADMIN'] },
  { to: '/drivers', label: 'Drivers', roles: ['ADMIN'] },
  { to: '/assignments', label: 'Assignments', roles: ['ADMIN'] },
  { to: '/maintenance-schedules', label: 'Maintenance', roles: ['ADMIN'] },
  { to: '/work-orders', label: 'Work Orders', roles: ['ADMIN', 'TECHNICIAN'] },
  { to: '/fault-reports', label: 'Fault Reports', roles: ['ADMIN', 'DRIVER'] },
  { to: '/fuel-logs', label: 'Fuel Logs', roles: ['ADMIN', 'DRIVER'] },
  { to: '/compliance-documents', label: 'Documents', roles: ['ADMIN'] },
  { to: '/reports', label: 'Reports', roles: ['ADMIN'] },
  { to: '/settings', label: 'Settings', roles: ['ADMIN', 'TECHNICIAN', 'DRIVER'] },
] satisfies Array<{
  to: string
  label: string
  roles: RoleName[]
}>

const roleLabels: Record<RoleName, string> = {
  ADMIN: 'Fleet Manager',
  TECHNICIAN: 'Technician',
  DRIVER: 'Driver',
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
}

export function AppLayout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()

  const visibleNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-shell d-flex">
      <aside className="sidebar p-3">
        <div className="mb-4">
          <div className="sidebar-title fs-4">VMMS</div>
          <div className="text-secondary small">Vehicle Maintenance Management</div>
        </div>

        <nav className="d-flex flex-column gap-1">
          {visibleNavItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="sidebar-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-area flex-grow-1 p-4">
        <header className="topbar summary-card p-3 mb-4">
          <div>
            <div className="text-secondary small">Signed in as</div>
            <div className="fw-semibold">{user?.name}</div>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className="badge rounded-pill text-bg-success">{user ? roleLabels[user.role] : 'User'}</span>
            <div className="user-avatar" aria-hidden="true">
              {user ? getInitials(user.name) : 'U'}
            </div>
            <button type="button" className="btn btn-outline-danger btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <Outlet />
      </main>
    </div>
  )
}
