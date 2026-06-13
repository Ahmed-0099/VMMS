import { NavLink } from 'react-router-dom'
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

export function Sidebar() {
  const { user } = useAuth()
  const visibleNavItems = navItems.filter((item) => user && item.roles.includes(user.role))

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-logo" aria-hidden="true">
          VM
        </div>
        <div>
          <div className="sidebar-title">VMMS</div>
          <div className="sidebar-subtitle">Fleet operations</div>
        </div>
      </div>

      <nav className="sidebar-nav" aria-label="Primary navigation">
        {visibleNavItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `sidebar-link${isActive ? ' active' : ''}`}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
