import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RoleGuard } from './components/RoleGuard'
import { Assignments } from './pages/Assignments'
import { ComplianceDocuments } from './pages/ComplianceDocuments'
import { Dashboard } from './pages/Dashboard'
import { DriverDetail } from './pages/DriverDetail'
import { Drivers } from './pages/Drivers'
import { FaultReports } from './pages/FaultReports'
import { FuelLogs } from './pages/FuelLogs'
import { Login } from './pages/Login'
import { MaintenanceSchedules } from './pages/MaintenanceSchedules'
import { MyVehicle } from './pages/MyVehicle'
import { PlaceholderPage } from './pages/PlaceholderPage'
import { Register } from './pages/Register'
import { Reports } from './pages/Reports'
import { VehicleDetail } from './pages/VehicleDetail'
import { Vehicles } from './pages/Vehicles'
import { WorkOrderDetail } from './pages/WorkOrderDetail'
import { WorkOrders } from './pages/WorkOrders'
import type { RoleName } from './types/auth'
import './App.css'

const pages = [
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
          <Route
            path="drivers"
            element={
              <RoleGuard allowedRoles={['ADMIN']} fallback={<AccessDenied />}>
                <Drivers />
              </RoleGuard>
            }
          />
          <Route
            path="drivers/:id"
            element={
              <RoleGuard allowedRoles={['ADMIN']} fallback={<AccessDenied />}>
                <DriverDetail />
              </RoleGuard>
            }
          />
          <Route
            path="assignments"
            element={
              <RoleGuard allowedRoles={['ADMIN']} fallback={<AccessDenied />}>
                <Assignments />
              </RoleGuard>
            }
          />
          <Route
            path="my-vehicle"
            element={
              <RoleGuard allowedRoles={['DRIVER']} fallback={<AccessDenied />}>
                <MyVehicle />
              </RoleGuard>
            }
          />
          <Route
            path="work-orders"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TECHNICIAN']} fallback={<AccessDenied />}>
                <WorkOrders />
              </RoleGuard>
            }
          />
          <Route
            path="work-orders/:id"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'TECHNICIAN']} fallback={<AccessDenied />}>
                <WorkOrderDetail />
              </RoleGuard>
            }
          />
          <Route
            path="fuel-logs"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'DRIVER']} fallback={<AccessDenied />}>
                <FuelLogs />
              </RoleGuard>
            }
          />
          <Route
            path="fault-reports"
            element={
              <RoleGuard allowedRoles={['ADMIN', 'DRIVER']} fallback={<AccessDenied />}>
                <FaultReports />
              </RoleGuard>
            }
          />
          <Route
            path="compliance-documents"
            element={
              <RoleGuard allowedRoles={['ADMIN']} fallback={<AccessDenied />}>
                <ComplianceDocuments />
              </RoleGuard>
            }
          />
          <Route
            path="maintenance-schedules"
            element={
              <RoleGuard allowedRoles={['ADMIN']} fallback={<AccessDenied />}>
                <MaintenanceSchedules />
              </RoleGuard>
            }
          />
          <Route
            path="reports"
            element={
              <RoleGuard allowedRoles={['ADMIN']} fallback={<AccessDenied />}>
                <Reports />
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
