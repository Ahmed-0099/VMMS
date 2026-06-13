import { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/common/StatusBadge'
import { VehicleForm } from '../components/vehicles/VehicleForm'
import { deleteVehicle, getVehicle, toVehicleFormValues, updateVehicle } from '../services/vehicleService'
import { emptyVehicleFormValues } from '../types/vehicle'
import type { Vehicle, VehicleFormValues, VehicleStatus } from '../types/vehicle'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const statusDisplay: Record<VehicleStatus, { label: string; tone: 'success' | 'warning' | 'danger' }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  IN_MAINTENANCE: { label: 'In Maintenance', tone: 'warning' },
  OUT_OF_SERVICE: { label: 'Out of Service', tone: 'danger' },
}

function formatValue(value: string | number | null | undefined, fallback = 'Not set') {
  return value === null || value === undefined || value === '' ? fallback : value
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function VehicleDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [formValues, setFormValues] = useState<VehicleFormValues>(emptyVehicleFormValues)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  useEffect(() => {
    let isMounted = true

    async function loadVehicle() {
      if (!id) {
        return
      }

      try {
        const nextVehicle = await getVehicle(id)

        if (isMounted) {
          setVehicle(nextVehicle)
          setFormValues(toVehicleFormValues(nextVehicle))
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load vehicle details.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadVehicle()

    return () => {
      isMounted = false
    }
  }, [id])

  if (!id) {
    return <Navigate to="/vehicles" replace />
  }

  async function handleUpdate() {
    if (!id) {
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const updatedVehicle = await updateVehicle(id, formValues)
      setVehicle(updatedVehicle)
      setFormValues(toVehicleFormValues(updatedVehicle))
      setIsEditing(false)
      setSuccessMessage('Vehicle updated successfully.')
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to update vehicle. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!vehicle) {
      return
    }

    const confirmed = window.confirm(`Delete vehicle ${vehicle.registrationNumber}? This only works if it has no related records.`)

    if (!confirmed) {
      return
    }

    try {
      await deleteVehicle(vehicle.id)
      navigate('/vehicles', { replace: true })
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to delete vehicle. Change its status if it has related records.'))
    }
  }

  if (isLoading) {
    return (
      <section className="module-panel">
        <div className="vehicle-table-state" role="status">
          Loading vehicle details...
        </div>
      </section>
    )
  }

  if (!vehicle) {
    return (
      <section className="module-panel">
        <div className="vehicle-table-state">
          <h3>Vehicle not found</h3>
          <p>The selected vehicle could not be loaded.</p>
          <Link className="btn btn-outline-secondary" to="/vehicles">
            Back to Vehicles
          </Link>
        </div>
      </section>
    )
  }

  const status = statusDisplay[vehicle.status]
  const latestAssignment = vehicle.assignments?.[0]

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Vehicle detail</span>
          <h2 className="dashboard-title">{vehicle.registrationNumber}</h2>
          <p className="dashboard-subtitle">
            {vehicle.make} {vehicle.model}
            {vehicle.year ? ` • ${vehicle.year}` : ''}
          </p>
        </div>
        <div className="module-actions">
          <Link className="btn btn-outline-secondary" to="/vehicles">
            Back
          </Link>
          <button className="btn btn-outline-success" type="button" onClick={() => setIsEditing((value) => !value)}>
            {isEditing ? 'Close Edit' : 'Edit'}
          </button>
          <button className="btn btn-outline-danger" type="button" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {(error || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || error}
        </div>
      )}

      <section className="module-panel">
        <div className="vehicle-detail-top">
          <div>
            <span className="section-kicker">Current status</span>
            <h3>{vehicle.registrationNumber}</h3>
          </div>
          <StatusBadge label={status.label} tone={status.tone} />
        </div>

        <div className="vehicle-detail-grid">
          <div>
            <span>Make</span>
            <strong>{vehicle.make}</strong>
          </div>
          <div>
            <span>Model</span>
            <strong>{vehicle.model}</strong>
          </div>
          <div>
            <span>Year</span>
            <strong>{formatValue(vehicle.year)}</strong>
          </div>
          <div>
            <span>Fuel type</span>
            <strong>{vehicle.fuelType}</strong>
          </div>
          <div>
            <span>Category</span>
            <strong>{formatValue(vehicle.category, 'General')}</strong>
          </div>
          <div>
            <span>Odometer</span>
            <strong>{vehicle.currentOdometer === null ? 'Not set' : `${vehicle.currentOdometer.toLocaleString()} km`}</strong>
          </div>
          <div>
            <span>VIN / chassis</span>
            <strong>{formatValue(vehicle.vin)}</strong>
          </div>
          <div>
            <span>Created</span>
            <strong>{formatDate(vehicle.createdAt)}</strong>
          </div>
        </div>
      </section>

      <section className="module-panel">
        <div className="module-panel-header">
          <div>
            <span className="section-kicker">Linked activity</span>
            <h3>Vehicle record summary</h3>
          </div>
        </div>

        <div className="vehicle-count-grid">
          <div>
            <span>Assignments</span>
            <strong>{vehicle._count?.assignments ?? 0}</strong>
          </div>
          <div>
            <span>Work orders</span>
            <strong>{vehicle._count?.workOrders ?? 0}</strong>
          </div>
          <div>
            <span>Fuel logs</span>
            <strong>{vehicle._count?.fuelLogs ?? 0}</strong>
          </div>
          <div>
            <span>Documents</span>
            <strong>{vehicle._count?.complianceDocuments ?? 0}</strong>
          </div>
        </div>

        <div className="vehicle-assignment-strip">
          <span>Latest assignment</span>
          <strong>{latestAssignment ? latestAssignment.driver.fullName : 'No assignment recorded'}</strong>
        </div>
      </section>

      {isEditing ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">Edit vehicle</span>
              <h3>Update registry details</h3>
            </div>
          </div>
          <VehicleForm
            values={formValues}
            isSubmitting={isSubmitting}
            submitLabel="Update vehicle"
            onCancel={() => {
              setIsEditing(false)
              setFormValues(toVehicleFormValues(vehicle))
            }}
            onChange={setFormValues}
            onSubmit={handleUpdate}
          />
        </section>
      ) : null}
    </>
  )
}
