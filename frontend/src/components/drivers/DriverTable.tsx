import { Link } from 'react-router-dom'
import { StatusBadge } from '../common/StatusBadge'
import type { Driver, DriverStatus } from '../../types/driver'

type DriverTableProps = {
  drivers: Driver[]
  isLoading: boolean
  onEdit: (driver: Driver) => void
  onDelete: (driver: Driver) => void
}

const statusDisplay: Record<DriverStatus, { label: string; tone: 'success' | 'neutral' }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  INACTIVE: { label: 'Inactive', tone: 'neutral' },
}

function getLicenseStatus(expiryDate: string) {
  const today = new Date()
  const expiry = new Date(expiryDate)
  const diffInDays = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 0) {
    return { label: 'Expired', tone: 'danger' as const }
  }

  if (diffInDays <= 30) {
    return { label: 'Expiring Soon', tone: 'warning' as const }
  }

  return { label: 'Valid', tone: 'success' as const }
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function DriverTable({ drivers, isLoading, onEdit, onDelete }: DriverTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading driver records...
      </div>
    )
  }

  if (drivers.length === 0) {
    return (
      <div className="vehicle-table-state">
        <h3>No drivers found</h3>
        <p>Add a driver or adjust your filters to build the driver registry.</p>
      </div>
    )
  }

  return (
    <div className="vehicle-table-wrap driver-table-wrap">
      <table className="table driver-table align-middle mb-0">
        <thead>
          <tr>
            <th>Driver</th>
            <th>License</th>
            <th>License Expiry</th>
            <th>Phone</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => {
            const status = statusDisplay[driver.status]
            const licenseStatus = getLicenseStatus(driver.licenseExpiry)

            return (
              <tr key={driver.id}>
                <td>
                  <Link className="vehicle-reg-link" to={`/drivers/${driver.id}`}>
                    {driver.fullName}
                  </Link>
                  <div className="vehicle-muted-text">{driver.cnic ?? 'CNIC not set'}</div>
                </td>
                <td>
                  <div className="vehicle-main-text">{driver.licenseNumber}</div>
                  <div className="vehicle-muted-text">{driver.user ? `Linked to ${driver.user.email}` : 'No linked user'}</div>
                </td>
                <td>
                  <div className="driver-expiry-cell">
                    <span>{formatDate(driver.licenseExpiry)}</span>
                    <StatusBadge label={licenseStatus.label} tone={licenseStatus.tone} />
                  </div>
                </td>
                <td>{driver.phone ?? 'Not set'}</td>
                <td>
                  <StatusBadge label={status.label} tone={status.tone} />
                </td>
                <td>
                  <div className="vehicle-actions">
                    <Link className="btn btn-sm btn-outline-secondary" to={`/drivers/${driver.id}`}>
                      View
                    </Link>
                    <button className="btn btn-sm btn-outline-success" type="button" onClick={() => onEdit(driver)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onDelete(driver)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
