import type { RoleName } from '../../types/auth'
import type { FuelLog } from '../../types/fuelLog'

type FuelLogTableProps = {
  currentRole: RoleName
  fuelLogs: FuelLog[]
  isLoading: boolean
  onDelete: (fuelLog: FuelLog) => void
  onEdit: (fuelLog: FuelLog) => void
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', {
    currency: 'PKR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function formatQuantity(value: number) {
  return `${value.toLocaleString('en-PK', { maximumFractionDigits: 2 })} L`
}

function getDriverLabel(fuelLog: FuelLog) {
  if (!fuelLog.driver) {
    return {
      detail: 'Manual admin entry',
      name: 'Not linked',
    }
  }

  return {
    detail: fuelLog.driver.user?.email ?? fuelLog.driver.licenseNumber,
    name: fuelLog.driver.fullName,
  }
}

export function FuelLogTable({ currentRole, fuelLogs, isLoading, onDelete, onEdit }: FuelLogTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading fuel logs...
      </div>
    )
  }

  if (fuelLogs.length === 0) {
    return (
      <div className="vehicle-table-state">
        <h3>No fuel logs found</h3>
        <p>Add a fuel log or adjust filters to see fuel history.</p>
      </div>
    )
  }

  return (
    <div className="vehicle-table-wrap fuel-log-table-wrap">
      <table className="table fuel-log-table align-middle mb-0">
        <thead>
          <tr>
            <th>Date</th>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Fuel</th>
            <th>Unit Cost</th>
            <th>Total</th>
            <th>Odometer</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fuelLogs.map((fuelLog) => {
            const driver = getDriverLabel(fuelLog)

            return (
              <tr key={fuelLog.id}>
                <td>
                  <div className="vehicle-main-text">{formatDate(fuelLog.date)}</div>
                  <div className="vehicle-muted-text">{fuelLog.fuelType}</div>
                </td>
                <td>
                  <div className="vehicle-main-text">{fuelLog.vehicle.registrationNumber}</div>
                  <div className="vehicle-muted-text">
                    {fuelLog.vehicle.make} {fuelLog.vehicle.model}
                  </div>
                </td>
                <td>
                  <div className="vehicle-main-text">{driver.name}</div>
                  <div className="vehicle-muted-text">{driver.detail}</div>
                </td>
                <td>
                  <div className="vehicle-main-text">{formatQuantity(fuelLog.quantity)}</div>
                  <div className="vehicle-muted-text">{fuelLog.fuelType}</div>
                </td>
                <td>{formatCurrency(fuelLog.unitCost)}</td>
                <td>
                  <strong className="fuel-log-total-text">{formatCurrency(fuelLog.totalAmount)}</strong>
                </td>
                <td>{fuelLog.odometerReading === null ? 'Not set' : `${fuelLog.odometerReading.toLocaleString()} km`}</td>
                <td>
                  <div className="vehicle-actions fuel-log-actions">
                    <button className="btn btn-sm btn-outline-success" type="button" onClick={() => onEdit(fuelLog)}>
                      Edit
                    </button>
                    {currentRole === 'ADMIN' ? (
                      <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onDelete(fuelLog)}>
                        Delete
                      </button>
                    ) : null}
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
