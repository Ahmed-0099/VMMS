import { Link } from 'react-router-dom'
import { StatusBadge } from '../common/StatusBadge'
import type { Vehicle, VehicleStatus } from '../../types/vehicle'

type VehicleTableProps = {
  vehicles: Vehicle[]
  isLoading: boolean
  onEdit: (vehicle: Vehicle) => void
  onDelete: (vehicle: Vehicle) => void
}

const statusDisplay: Record<VehicleStatus, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  IN_MAINTENANCE: { label: 'In Maintenance', tone: 'warning' },
  OUT_OF_SERVICE: { label: 'Out of Service', tone: 'danger' },
}

function formatOdometer(value: number | null) {
  return value === null ? 'Not set' : `${value.toLocaleString()} km`
}

export function VehicleTable({ vehicles, isLoading, onEdit, onDelete }: VehicleTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading vehicle registry...
      </div>
    )
  }

  if (vehicles.length === 0) {
    return (
      <div className="vehicle-table-state">
        <h3>No vehicles found</h3>
        <p>Add a vehicle or adjust your filters to build the fleet registry.</p>
      </div>
    )
  }

  return (
    <div className="vehicle-table-wrap">
      <table className="table vehicle-table align-middle mb-0">
        <thead>
          <tr>
            <th>Registration</th>
            <th>Make / Model</th>
            <th>Category</th>
            <th>Fuel</th>
            <th>Odometer</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((vehicle) => {
            const status = statusDisplay[vehicle.status]

            return (
              <tr key={vehicle.id}>
                <td>
                  <Link className="vehicle-reg-link" to={`/vehicles/${vehicle.id}`}>
                    {vehicle.registrationNumber}
                  </Link>
                </td>
                <td>
                  <div className="vehicle-main-text">{vehicle.make}</div>
                  <div className="vehicle-muted-text">
                    {vehicle.model}
                    {vehicle.year ? ` • ${vehicle.year}` : ''}
                  </div>
                </td>
                <td>{vehicle.category ?? 'General'}</td>
                <td>{vehicle.fuelType}</td>
                <td>{formatOdometer(vehicle.currentOdometer)}</td>
                <td>
                  <StatusBadge label={status.label} tone={status.tone} />
                </td>
                <td>
                  <div className="vehicle-actions">
                    <Link className="btn btn-sm btn-outline-secondary" to={`/vehicles/${vehicle.id}`}>
                      View
                    </Link>
                    <button className="btn btn-sm btn-outline-success" type="button" onClick={() => onEdit(vehicle)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onDelete(vehicle)}>
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
