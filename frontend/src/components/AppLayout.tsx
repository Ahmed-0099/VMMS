import { NavLink, Outlet } from 'react-router-dom'

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/vehicles', label: 'Vehicles' },
  { to: '/drivers', label: 'Drivers' },
  { to: '/assignments', label: 'Assignments' },
  { to: '/maintenance-schedules', label: 'Maintenance' },
  { to: '/work-orders', label: 'Work Orders' },
  { to: '/fault-reports', label: 'Fault Reports' },
  { to: '/fuel-logs', label: 'Fuel Logs' },
  { to: '/compliance-documents', label: 'Documents' },
  { to: '/reports', label: 'Reports' },
  { to: '/settings', label: 'Settings' },
]

export function AppLayout() {
  return (
    <div className="app-shell d-flex">
      <aside className="sidebar p-3">
        <div className="mb-4">
          <div className="sidebar-title fs-4">VMMS</div>
          <div className="text-secondary small">Vehicle Maintenance Management</div>
        </div>

        <nav className="d-flex flex-column gap-1">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className="sidebar-link">
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      <main className="content-area flex-grow-1 p-4">
        <Outlet />
      </main>
    </div>
  )
}
