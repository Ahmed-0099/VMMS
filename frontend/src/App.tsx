import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleGuard } from './components/RoleGuard'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { Register } from './pages/Register'
import { VehicleDetail } from './pages/VehicleDetail'
import { Vehicles } from './pages/Vehicles'
import type { RoleName } from './types/auth'
import './App.css'

const pages = [
  { path: 'drivers', title: 'Drivers', description: 'Driver profiles, license details, and status tracking.', roles: ['ADMIN'] },
  { path: 'assignments', title: 'Assignments', description: 'Active and historical driver-to-vehicle assignments.', roles: ['ADMIN'] },
  { path: 'maintenance-schedules', title: 'Maintenance Schedules', description: 'Preventive maintenance due dates and odometer triggers.', roles: ['ADMIN'] },
  { path: 'work-orders', title: 'Work Orders', description: 'Maintenance job cards, technician assignments, and repair statuses.', roles: ['ADMIN', 'TECHNICIAN'] },
  { path: 'fault-reports', title: 'Fault Reports', description: 'Driver-submitted vehicle issues and review workflow.', roles: ['ADMIN', 'DRIVER'] },
  { path: 'fuel-logs', title: 'Fuel Logs', description: 'Fuel fill-up records, costs, and odometer readings.', roles: ['ADMIN', 'DRIVER'] },
  { path: 'compliance-documents', title: 'Compliance Documents', description: 'Registration, insurance, and expiry tracking.', roles: ['ADMIN'] },
  { path: 'reports', title: 'Reports', description: 'Vehicle, fuel, work order, and compliance summaries.', roles: ['ADMIN'] },
  { path: 'settings', title: 'Settings', description: 'Basic account and project settings.', roles: ['ADMIN', 'TECHNICIAN', 'DRIVER'] },
] satisfies Array<{
  path: string
  title: string
  description: string
  roles: RoleName[]
}>

function AccessDenied() {
  return (
    <section className="summary-card p-4">
      <h1 className="page-title h3 mb-2">Access restricted</h1>
      <p className="text-secondary mb-0">Your role does not include access to this VMMS module.</p>
    </section>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route
            path="vehicles"
            element={
              <RoleGuard allowedRoles={['ADMIN']} fallback={<AccessDenied />}>
                <Vehicles />
              </RoleGuard>
            }
          />
          <Route
            path="vehicles/:id"
            element={
              <RoleGuard allowedRoles={['ADMIN']} fallback={<AccessDenied />}>
                <VehicleDetail />
              </RoleGuard>
            }
          />
          {pages.map((page) => (
            <Route
              key={page.path}
              path={page.path}
              element={
                <RoleGuard allowedRoles={page.roles} fallback={<AccessDenied />}>
                  <PlaceholderPage title={page.title} description={page.description} />
                </RoleGuard>
              }
            />
          ))}
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
