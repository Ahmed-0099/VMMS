import { useCallback, useEffect, useMemo, useState } from 'react'
import { FuelLogForm } from '../components/fuelLogs/FuelLogForm'
import { FuelLogTable } from '../components/fuelLogs/FuelLogTable'
import { SummaryCard } from '../components/SummaryCard'
import { useAuth } from '../context/AuthContext'
import { useFuelLogs } from '../hooks/useFuelLogs'
import { getMyActiveAssignment } from '../services/assignmentService'
import { getDrivers } from '../services/driverService'
import { createFuelLog, deleteFuelLog, toFuelLogFormValues, updateFuelLog } from '../services/fuelLogService'
import { getVehicles } from '../services/vehicleService'
import type { VehicleAssignment } from '../types/assignment'
import type { Driver } from '../types/driver'
import { defaultFuelLogFilters, emptyFuelLogFormValues, type FuelLog, type FuelLogFormValues } from '../types/fuelLog'
import type { Vehicle } from '../types/vehicle'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

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

function getDriverFormDefaults(assignment: VehicleAssignment | null): FuelLogFormValues {
  if (!assignment) {
    return emptyFuelLogFormValues
  }

  return {
    ...emptyFuelLogFormValues,
    driverId: assignment.driverId,
    fuelType: assignment.vehicle.fuelType || emptyFuelLogFormValues.fuelType,
    vehicleId: assignment.vehicleId,
  }
}

export function FuelLogs() {
  const { user } = useAuth()
  const { error, filters, fuelLogs, isLoading, reload, setFilters, summary } = useFuelLogs()
  const [formValues, setFormValues] = useState<FuelLogFormValues>(emptyFuelLogFormValues)
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLog | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [activeAssignment, setActiveAssignment] = useState<VehicleAssignment | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [optionsError, setOptionsError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isAdmin = user?.role === 'ADMIN'
  const isDriver = user?.role === 'DRIVER'

  const lockedVehicle = useMemo(() => {
    if (editingFuelLog) {
      return editingFuelLog.vehicle
    }

    return activeAssignment?.vehicle ?? null
  }, [activeAssignment, editingFuelLog])

  const loadFormOptions = useCallback(async () => {
    await Promise.resolve()
    setIsOptionsLoading(true)
    setOptionsError('')

    try {
      if (isAdmin) {
        const [vehicleList, driverList] = await Promise.all([
          getVehicles({ category: '', fuelType: '', search: '', status: '' }),
          getDrivers({ search: '', status: 'ACTIVE' }),
        ])

        setVehicles(vehicleList)
        setDrivers(driverList)
        return
      }

      if (isDriver) {
        const response = await getMyActiveAssignment()
        setActiveAssignment(response.assignment)

        if (response.assignment) {
          setFormValues((currentValues) => {
            if (editingFuelLog || currentValues.vehicleId) {
              return currentValues
            }

            return getDriverFormDefaults(response.assignment)
          })
        }
      }
    } catch (apiError) {
      setOptionsError(getApiErrorMessage(apiError, 'Unable to load fuel log options.'))
    } finally {
      setIsOptionsLoading(false)
    }
  }, [editingFuelLog, isAdmin, isDriver])

  useEffect(() => {
    let isMounted = true

    async function loadInitialOptions() {
      await Promise.resolve()

      if (!isMounted) {
        return
      }

      await loadFormOptions()
    }

    loadInitialOptions()

    return () => {
      isMounted = false
    }
  }, [loadFormOptions])

  function openCreateForm() {
    setFormValues(isDriver ? getDriverFormDefaults(activeAssignment) : emptyFuelLogFormValues)
    setEditingFuelLog(null)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function openEditForm(fuelLog: FuelLog) {
    setFormValues(toFuelLogFormValues(fuelLog))
    setEditingFuelLog(fuelLog)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setEditingFuelLog(null)
    setFormValues(isDriver ? getDriverFormDefaults(activeAssignment) : emptyFuelLogFormValues)
    setFormError('')
    setIsFormOpen(false)
  }

  function clearFilters() {
    setFilters(defaultFuelLogFilters)
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      if (editingFuelLog) {
        await updateFuelLog(editingFuelLog.id, formValues)
        setSuccessMessage('Fuel log updated successfully.')
      } else {
        await createFuelLog(formValues)
        setSuccessMessage('Fuel log created successfully.')
      }

      closeForm()
      await Promise.all([reload(), loadFormOptions()])
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to save fuel log. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(fuelLog: FuelLog) {
    const confirmed = window.confirm(`Delete fuel log for ${fuelLog.vehicle.registrationNumber}?`)

    if (!confirmed) {
      return
    }

    setFormError('')
    setSuccessMessage('')

    try {
      await deleteFuelLog(fuelLog.id)
      setSuccessMessage('Fuel log deleted successfully.')
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to delete fuel log.'))
    }
  }

  const shouldShowForm = isAdmin ? isFormOpen : Boolean(activeAssignment || editingFuelLog)

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Fuel logs</span>
          <h2 className="dashboard-title">{isAdmin ? 'Fuel cost command center' : 'My fuel entries'}</h2>
          <p className="dashboard-subtitle">
            {isAdmin
              ? 'Review fuel spend, log fill-ups, and keep vehicle fuel history ready for reports.'
              : 'Add fuel fill-ups for your assigned vehicle and review your own fuel history.'}
          </p>
        </div>
        <button className="btn btn-success module-primary-action" type="button" onClick={openCreateForm}>
          {isAdmin ? 'Add Fuel Log' : 'New Fuel Entry'}
        </button>
      </div>

      {(error || formError || optionsError || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || formError || optionsError || error}
        </div>
      )}

      <div className="dashboard-grid fuel-summary-grid">
        <SummaryCard
          helperText="Fuel quantity in the current list"
          isLoading={isLoading}
          label="Total Quantity"
          tone="success"
          value={formatQuantity(summary.totalQuantity)}
        />
        <SummaryCard
          helperText="Backend-calculated total fuel spend"
          isLoading={isLoading}
          label="Total Fuel Cost"
          tone="warning"
          value={formatCurrency(summary.totalCost)}
        />
        <SummaryCard
          helperText="Total cost divided by total quantity"
          isLoading={isLoading}
          label="Average Unit Cost"
          tone="neutral"
          value={formatCurrency(summary.averageUnitCost)}
        />
        <SummaryCard
          helperText="Fuel log records after filters"
          isLoading={isLoading}
          label="Fuel Entries"
          tone="neutral"
          value={fuelLogs.length}
        />
      </div>

      {shouldShowForm ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">{editingFuelLog ? 'Edit fuel log' : 'Quick fuel entry'}</span>
              <h3>{editingFuelLog ? editingFuelLog.vehicle.registrationNumber : 'Record a fill-up'}</h3>
            </div>
          </div>
          <FuelLogForm
            drivers={drivers}
            isLoadingOptions={isOptionsLoading}
            isSubmitting={isSubmitting}
            lockedVehicle={lockedVehicle}
            mode={isAdmin ? 'admin' : 'driver'}
            submitLabel={editingFuelLog ? 'Update fuel log' : 'Save fuel log'}
            values={formValues}
            vehicles={vehicles}
            onCancel={closeForm}
            onChange={setFormValues}
            onSubmit={handleSubmit}
          />
        </section>
      ) : isDriver && !isOptionsLoading ? (
        <section className="module-panel">
          <div className="vehicle-table-state">
            <h3>No active vehicle assigned</h3>
            <p>Your fleet manager needs to assign a vehicle before you can add fuel logs.</p>
          </div>
        </section>
      ) : null}

      <section className="module-panel">
        <div className="fuel-log-toolbar">
          {isAdmin ? (
            <>
              <div>
                <label className="form-label" htmlFor="fuelLogVehicleFilter">
                  Vehicle
                </label>
                <select
                  className="form-select"
                  id="fuelLogVehicleFilter"
                  value={filters.vehicleId}
                  onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, vehicleId: event.target.value }))}
                >
                  <option value="">All vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="fuelLogDriverFilter">
                  Driver
                </label>
                <select
                  className="form-select"
                  id="fuelLogDriverFilter"
                  value={filters.driverId}
                  onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, driverId: event.target.value }))}
                >
                  <option value="">All drivers</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          <div>
            <label className="form-label" htmlFor="fuelLogFromFilter">
              From
            </label>
            <input
              className="form-control"
              id="fuelLogFromFilter"
              type="date"
              value={filters.from}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, from: event.target.value }))}
            />
          </div>

          <div>
            <label className="form-label" htmlFor="fuelLogToFilter">
              To
            </label>
            <input
              className="form-control"
              id="fuelLogToFilter"
              type="date"
              value={filters.to}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, to: event.target.value }))}
            />
          </div>

          <div className="fuel-log-toolbar-action">
            <button className="btn btn-outline-secondary" type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <FuelLogTable
          currentRole={user?.role ?? 'DRIVER'}
          fuelLogs={fuelLogs}
          isLoading={isLoading}
          onDelete={handleDelete}
          onEdit={openEditForm}
        />
      </section>
    </>
  )
}
