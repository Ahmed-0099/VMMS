import { useCallback, useEffect, useState } from 'react'
import { DriverForm } from '../components/drivers/DriverForm'
import { DriverTable } from '../components/drivers/DriverTable'
import { createDriver, deleteDriver, getDriverUsers, toDriverFormValues, updateDriver } from '../services/driverService'
import { DRIVER_STATUSES, emptyDriverFormValues } from '../types/driver'
import type { Driver, DriverFormValues, DriverUserOption } from '../types/driver'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import { useDrivers } from '../hooks/useDrivers'

export function Drivers() {
  const { drivers, error, filters, isLoading, reload, setFilters } = useDrivers()
  const [formValues, setFormValues] = useState<DriverFormValues>(emptyDriverFormValues)
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [formError, setFormError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [driverUsers, setDriverUsers] = useState<DriverUserOption[]>([])
  const [driverUserError, setDriverUserError] = useState('')
  const [isDriverUsersLoading, setIsDriverUsersLoading] = useState(true)

  const loadDriverUsers = useCallback(async () => {
    await Promise.resolve()
    setIsDriverUsersLoading(true)
    setDriverUserError('')

    try {
      const users = await getDriverUsers()
      setDriverUsers(users)
    } catch (apiError) {
      setDriverUserError(getApiErrorMessage(apiError, 'Unable to load Driver login accounts.'))
    } finally {
      setIsDriverUsersLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialDriverUsers() {
      await Promise.resolve()

      if (isMounted) {
        setIsDriverUsersLoading(true)
        setDriverUserError('')
      }

      try {
        const users = await getDriverUsers()

        if (isMounted) {
          setDriverUsers(users)
        }
      } catch (apiError) {
        if (isMounted) {
          setDriverUserError(getApiErrorMessage(apiError, 'Unable to load Driver login accounts.'))
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

  function openCreateForm() {
    setFormValues(emptyDriverFormValues)
    setEditingDriver(null)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function openEditForm(driver: Driver) {
    setFormValues(toDriverFormValues(driver))
    setEditingDriver(driver)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingDriver(null)
    setFormValues(emptyDriverFormValues)
    setFormError('')
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      if (editingDriver) {
        await updateDriver(editingDriver.id, formValues)
        setSuccessMessage('Driver updated successfully.')
      } else {
        await createDriver(formValues)
        setSuccessMessage('Driver added successfully.')
      }

      closeForm()
      await Promise.all([reload(), loadDriverUsers()])
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to save driver. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(driver: Driver) {
    const confirmed = window.confirm(`Delete driver ${driver.fullName}? Drivers with related records will be marked inactive instead.`)

    if (!confirmed) {
      return
    }

    setFormError('')
    setSuccessMessage('')

    try {
      const response = await deleteDriver(driver.id)
      setSuccessMessage(response.action === 'deleted' ? 'Driver deleted successfully.' : 'Driver has related records and was marked inactive.')
      await Promise.all([reload(), loadDriverUsers()])
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to delete driver. Try marking the driver inactive instead.'))
    }
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Driver registry</span>
          <h2 className="dashboard-title">Manage fleet drivers</h2>
          <p className="dashboard-subtitle">Track driver profiles, license expiry, status, contact details, and optional linked login accounts.</p>
        </div>
        <button className="btn btn-success module-primary-action" type="button" onClick={openCreateForm}>
          Add Driver
        </button>
      </div>

      {(error || formError || driverUserError || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || formError || driverUserError || error}
        </div>
      )}

      {isFormOpen ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">{editingDriver ? 'Edit driver' : 'New driver'}</span>
              <h3>{editingDriver ? editingDriver.fullName : 'Add driver profile'}</h3>
            </div>
          </div>
          <DriverForm
            values={formValues}
            isSubmitting={isSubmitting}
            isLoadingDriverUsers={isDriverUsersLoading}
            linkedDriverOptions={driverUsers}
            submitLabel={editingDriver ? 'Update driver' : 'Create driver'}
            currentDriverId={editingDriver?.id ?? null}
            onCancel={closeForm}
            onChange={setFormValues}
            onSubmit={handleSubmit}
          />
        </section>
      ) : null}

      <section className="module-panel">
        <div className="driver-toolbar">
          <div className="vehicle-search">
            <label className="form-label" htmlFor="driverSearch">
              Search
            </label>
            <input
              className="form-control"
              id="driverSearch"
              value={filters.search}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, search: event.target.value }))}
              placeholder="Name, CNIC, phone, license"
            />
          </div>

          <div>
            <label className="form-label" htmlFor="driverStatusFilter">
              Status
            </label>
            <select
              className="form-select"
              id="driverStatusFilter"
              value={filters.status}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, status: event.target.value as typeof filters.status }))}
            >
              <option value="">All statuses</option>
              {DRIVER_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <DriverTable drivers={drivers} isLoading={isLoading} onEdit={openEditForm} onDelete={handleDelete} />
      </section>
    </>
  )
}
