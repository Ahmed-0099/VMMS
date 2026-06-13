import { useCallback, useEffect, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { StatusBadge } from '../components/common/StatusBadge'
import { DriverForm } from '../components/drivers/DriverForm'
import { deleteDriver, getDriver, getDriverUsers, toDriverFormValues, updateDriver } from '../services/driverService'
import { emptyDriverFormValues } from '../types/driver'
import type { Driver, DriverFormValues, DriverStatus, DriverUserOption } from '../types/driver'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const statusDisplay: Record<DriverStatus, { label: string; tone: 'success' | 'neutral' }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  INACTIVE: { label: 'Inactive', tone: 'neutral' },
}

function formatValue(value: string | null | undefined, fallback = 'Not set') {
  return value === null || value === undefined || value === '' ? fallback : value
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
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

export function DriverDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [driver, setDriver] = useState<Driver | null>(null)
  const [formValues, setFormValues] = useState<DriverFormValues>(emptyDriverFormValues)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [driverUsers, setDriverUsers] = useState<DriverUserOption[]>([])
  const [isDriverUsersLoading, setIsDriverUsersLoading] = useState(true)

  const loadDriverUsers = useCallback(async () => {
    await Promise.resolve()
    setIsDriverUsersLoading(true)

    try {
      const users = await getDriverUsers()
      setDriverUsers(users)
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to load Driver login accounts.'))
    } finally {
      setIsDriverUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadDriver() {
      if (!id) {
        return
      }

      try {
        const nextDriver = await getDriver(id)

        if (isMounted) {
          setDriver(nextDriver)
          setFormValues(toDriverFormValues(nextDriver))
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load driver details.'))
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadDriver()

    return () => {
      isMounted = false
    }
  }, [id])

  useEffect(() => {
    let isMounted = true

    async function loadInitialDriverUsers() {
      await Promise.resolve()

      if (isMounted) {
        setIsDriverUsersLoading(true)
      }

      try {
        const users = await getDriverUsers()

        if (isMounted) {
          setDriverUsers(users)
        }
      } catch (apiError) {
        if (isMounted) {
          setError(getApiErrorMessage(apiError, 'Unable to load Driver login accounts.'))
        }
      } finally {
        if (isMounted) {
          setIsDriverUsersLoading(false)
        }
      }
    }

    loadInitialDriverUsers()

    return () => {
      isMounted = false
    }
  }, [])

  if (!id) {
    return <Navigate to="/drivers" replace />
  }

  async function handleUpdate() {
    if (!id) {
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccessMessage('')

    try {
      const updatedDriver = await updateDriver(id, formValues)
      setDriver(updatedDriver)
      setFormValues(toDriverFormValues(updatedDriver))
      setIsEditing(false)
      setSuccessMessage('Driver updated successfully.')
      await loadDriverUsers()
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to update driver. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete() {
    if (!driver) {
      return
    }

    const confirmed = window.confirm(`Delete driver ${driver.fullName}? Drivers with related records will be marked inactive instead.`)

    if (!confirmed) {
      return
    }

    try {
      await deleteDriver(driver.id)
      navigate('/drivers', { replace: true })
    } catch (apiError) {
      setError(getApiErrorMessage(apiError, 'Unable to delete driver. Try marking the driver inactive instead.'))
    }
  }

  if (isLoading) {
    return (
      <section className="module-panel">
        <div className="vehicle-table-state" role="status">
          Loading driver details...
        </div>
      </section>
    )
  }

  if (!driver) {
    return (
      <section className="module-panel">
        <div className="vehicle-table-state">
          <h3>Driver not found</h3>
          <p>The selected driver could not be loaded.</p>
          <Link className="btn btn-outline-secondary" to="/drivers">
            Back to Drivers
          </Link>
        </div>
      </section>
    )
  }

  const status = statusDisplay[driver.status]
  const licenseStatus = getLicenseStatus(driver.licenseExpiry)
  const latestAssignment = driver.assignments?.[0]

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Driver detail</span>
          <h2 className="dashboard-title">{driver.fullName}</h2>
          <p className="dashboard-subtitle">License {driver.licenseNumber}</p>
        </div>
        <div className="module-actions">
          <Link className="btn btn-outline-secondary" to="/drivers">
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
            <span className="section-kicker">Current profile</span>
            <h3>{driver.fullName}</h3>
          </div>
          <div className="driver-status-stack">
            <StatusBadge label={status.label} tone={status.tone} />
            <StatusBadge label={licenseStatus.label} tone={licenseStatus.tone} />
          </div>
        </div>

        <div className="vehicle-detail-grid">
          <div>
            <span>License number</span>
            <strong>{driver.licenseNumber}</strong>
          </div>
          <div>
            <span>License expiry</span>
            <strong>{formatDate(driver.licenseExpiry)}</strong>
          </div>
          <div>
            <span>CNIC / national ID</span>
            <strong>{formatValue(driver.cnic)}</strong>
          </div>
          <div>
            <span>Phone</span>
            <strong>{formatValue(driver.phone)}</strong>
          </div>
          <div>
            <span>Linked account</span>
            <strong>{driver.user ? driver.user.email : 'Not linked'}</strong>
          </div>
          <div>
            <span>Current assignment</span>
            <strong>{latestAssignment ? latestAssignment.vehicle.registrationNumber : 'No active assignment shown'}</strong>
          </div>
          <div className="driver-detail-wide">
            <span>Address</span>
            <strong>{formatValue(driver.address)}</strong>
          </div>
        </div>
      </section>

      <section className="module-panel">
        <div className="module-panel-header">
          <div>
            <span className="section-kicker">Linked activity</span>
            <h3>Driver record summary</h3>
          </div>
        </div>

        <div className="vehicle-count-grid">
          <div>
            <span>Assignments</span>
            <strong>{driver._count?.assignments ?? 0}</strong>
          </div>
          <div>
            <span>Fault reports</span>
            <strong>{driver._count?.faultReports ?? 0}</strong>
          </div>
          <div>
            <span>Fuel logs</span>
            <strong>{driver._count?.fuelLogs ?? 0}</strong>
          </div>
        </div>
      </section>

      {isEditing ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">Edit driver</span>
              <h3>Update driver profile</h3>
            </div>
          </div>
          <DriverForm
            values={formValues}
            isSubmitting={isSubmitting}
            isLoadingDriverUsers={isDriverUsersLoading}
            linkedDriverOptions={driverUsers}
            submitLabel="Update driver"
            currentDriverId={driver.id}
            onCancel={() => {
              setIsEditing(false)
              setFormValues(toDriverFormValues(driver))
            }}
            onChange={setFormValues}
            onSubmit={handleUpdate}
          />
        </section>
      ) : null}
    </>
  )
}
