import { useCallback, useEffect, useMemo, useState } from 'react'
import { AssignmentForm } from '../components/assignments/AssignmentForm'
import { AssignmentTable } from '../components/assignments/AssignmentTable'
import { createAssignment, endAssignment, getAssignments } from '../services/assignmentService'
import { getDrivers } from '../services/driverService'
import { getVehicles } from '../services/vehicleService'
import { ASSIGNMENT_STATUSES, emptyAssignmentFormValues } from '../types/assignment'
import type { AssignmentFormValues, VehicleAssignment } from '../types/assignment'
import type { Driver } from '../types/driver'
import type { Vehicle } from '../types/vehicle'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'
import { useAssignments } from '../hooks/useAssignments'

export function Assignments() {
  const { assignments, error, filters, isLoading, reload, setFilters } = useAssignments()
  const [formValues, setFormValues] = useState<AssignmentFormValues>(emptyAssignmentFormValues)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [activeAssignmentOptions, setActiveAssignmentOptions] = useState<VehicleAssignment[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [optionsError, setOptionsError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const activeAssignments = useMemo(() => assignments.filter((assignment) => assignment.status === 'ACTIVE'), [assignments])
  const assignmentHistory = useMemo(() => assignments.filter((assignment) => assignment.status === 'ENDED'), [assignments])

  const activeVehicleIds = useMemo(
    () => new Set(activeAssignmentOptions.map((assignment) => assignment.vehicleId)),
    [activeAssignmentOptions],
  )
  const activeDriverIds = useMemo(
    () => new Set(activeAssignmentOptions.map((assignment) => assignment.driverId)),
    [activeAssignmentOptions],
  )

  const loadAssignmentOptions = useCallback(async () => {
    await Promise.resolve()
    setIsOptionsLoading(true)
    setOptionsError('')

    try {
      const [vehicleList, driverList, activeAssignmentList] = await Promise.all([
        getVehicles({ category: '', fuelType: '', search: '', status: 'ACTIVE' }),
        getDrivers({ search: '', status: 'ACTIVE' }),
        getAssignments({ driverId: '', status: 'ACTIVE', vehicleId: '' }),
      ])

      setVehicles(vehicleList)
      setDrivers(driverList)
      setActiveAssignmentOptions(activeAssignmentList)
    } catch (apiError) {
      setOptionsError(getApiErrorMessage(apiError, 'Unable to load assignment dropdown options.'))
    } finally {
      setIsOptionsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialOptions() {
      await Promise.resolve()

      if (isMounted) {
        setIsOptionsLoading(true)
        setOptionsError('')
      }

      try {
        const [vehicleList, driverList, activeAssignmentList] = await Promise.all([
          getVehicles({ category: '', fuelType: '', search: '', status: 'ACTIVE' }),
          getDrivers({ search: '', status: 'ACTIVE' }),
          getAssignments({ driverId: '', status: 'ACTIVE', vehicleId: '' }),
        ])

        if (isMounted) {
          setVehicles(vehicleList)
          setDrivers(driverList)
          setActiveAssignmentOptions(activeAssignmentList)
        }
      } catch (apiError) {
        if (isMounted) {
          setOptionsError(getApiErrorMessage(apiError, 'Unable to load assignment dropdown options.'))
        }
      } finally {
        if (isMounted) {
          setIsOptionsLoading(false)
        }
      }
    }

    loadInitialOptions()

    return () => {
      isMounted = false
    }
  }, [])

  function openCreateForm() {
    setFormValues(emptyAssignmentFormValues)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setFormValues(emptyAssignmentFormValues)
    setFormError('')
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      await createAssignment(formValues)
      closeForm()
      setSuccessMessage('Vehicle assignment created successfully.')
      await Promise.all([reload(), loadAssignmentOptions()])
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to create assignment. Please review the selected driver and vehicle.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleEndAssignment(assignment: VehicleAssignment) {
    const confirmed = window.confirm(
      `End assignment for ${assignment.driver.fullName} and ${assignment.vehicle.registrationNumber}?`,
    )

    if (!confirmed) {
      return
    }

    setFormError('')
    setSuccessMessage('')

    try {
      await endAssignment(assignment.id)
      setSuccessMessage('Assignment ended successfully.')
      await Promise.all([reload(), loadAssignmentOptions()])
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to end assignment. Please try again.'))
    }
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Vehicle assignment</span>
          <h2 className="dashboard-title">Assign drivers to vehicles</h2>
          <p className="dashboard-subtitle">Create one active driver-to-vehicle assignment, end assignments, and keep history organized.</p>
        </div>
        <button className="btn btn-success module-primary-action" type="button" onClick={openCreateForm}>
          Assign Driver
        </button>
      </div>

      {(error || formError || optionsError || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || formError || optionsError || error}
        </div>
      )}

      {isFormOpen ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">New assignment</span>
              <h3>Connect a driver with an active vehicle</h3>
            </div>
          </div>
          <AssignmentForm
            activeDriverIds={activeDriverIds}
            activeVehicleIds={activeVehicleIds}
            drivers={drivers}
            isLoadingOptions={isOptionsLoading}
            isSubmitting={isSubmitting}
            values={formValues}
            vehicles={vehicles}
            onCancel={closeForm}
            onChange={setFormValues}
            onSubmit={handleSubmit}
          />
        </section>
      ) : null}

      <section className="module-panel">
        <div className="assignment-toolbar">
          <div>
            <label className="form-label" htmlFor="assignmentStatusFilter">
              Status
            </label>
            <select
              className="form-select"
              id="assignmentStatusFilter"
              value={filters.status}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, status: event.target.value as typeof filters.status }))}
            >
              <option value="">All assignments</option>
              {ASSIGNMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="assignment-section-heading">
          <div>
            <span className="section-kicker">Active assignments</span>
            <h3>Current vehicle responsibility</h3>
          </div>
          <span className="attention-status attention-status-clear">{activeAssignments.length} Active</span>
        </div>
        <AssignmentTable
          assignments={activeAssignments}
          emptyDescription="Create a new assignment to connect a driver with a vehicle."
          emptyTitle="No active assignments"
          isLoading={isLoading}
          onEnd={handleEndAssignment}
        />
      </section>

      <section className="module-panel">
        <div className="assignment-section-heading">
          <div>
            <span className="section-kicker">Assignment history</span>
            <h3>Ended driver-to-vehicle assignments</h3>
          </div>
          <span className="attention-status attention-status-clear">{assignmentHistory.length} Ended</span>
        </div>
        <AssignmentTable
          assignments={assignmentHistory}
          emptyDescription="Ended assignments will appear here after Admin closes an active assignment."
          emptyTitle="No assignment history"
          isLoading={isLoading}
          onEnd={handleEndAssignment}
        />
      </section>
    </>
  )
}
