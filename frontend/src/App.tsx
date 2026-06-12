import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { Dashboard } from './pages/Dashboard'
import { PlaceholderPage } from './pages/PlaceholderPage'
import './App.css'

const pages = [
  { path: 'vehicles', title: 'Vehicles', description: 'Vehicle registry and vehicle detail records.' },
  { path: 'drivers', title: 'Drivers', description: 'Driver profiles, license details, and status tracking.' },
  { path: 'assignments', title: 'Assignments', description: 'Active and historical driver-to-vehicle assignments.' },
  { path: 'maintenance-schedules', title: 'Maintenance Schedules', description: 'Preventive maintenance due dates and odometer triggers.' },
  { path: 'work-orders', title: 'Work Orders', description: 'Maintenance job cards, technician assignments, and repair statuses.' },
  { path: 'fault-reports', title: 'Fault Reports', description: 'Driver-submitted vehicle issues and review workflow.' },
  { path: 'fuel-logs', title: 'Fuel Logs', description: 'Fuel fill-up records, costs, and odometer readings.' },
  { path: 'compliance-documents', title: 'Compliance Documents', description: 'Registration, insurance, and expiry tracking.' },
  { path: 'reports', title: 'Reports', description: 'Vehicle, fuel, work order, and compliance summaries.' },
  { path: 'settings', title: 'Settings', description: 'Basic account and project settings.' },
]

function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        {pages.map((page) => (
          <Route
            key={page.path}
            path={page.path}
            element={<PlaceholderPage title={page.title} description={page.description} />}
          />
        ))}
      </Route>
    </Routes>
  )
}

export default App
