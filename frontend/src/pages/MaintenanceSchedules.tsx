import { useCallback, useEffect, useState } from 'react'
import { CreateWorkOrderFromScheduleModal } from '../components/maintenanceSchedules/CreateWorkOrderFromScheduleModal'
import { MaintenanceScheduleForm } from '../components/maintenanceSchedules/MaintenanceScheduleForm'
import { MaintenanceScheduleTable } from '../components/maintenanceSchedules/MaintenanceScheduleTable'
import { SummaryCard } from '../components/SummaryCard'
import { useMaintenanceSchedules } from '../hooks/useMaintenanceSchedules'
import {
  createMaintenanceSchedule,
  createWorkOrderFromSchedule,
  deleteMaintenanceSchedule,
  toMaintenanceScheduleFormValues,
  updateMaintenanceSchedule,
} from '../services/maintenanceScheduleService'
import { getVehicles } from '../services/vehicleService'
import { getWorkOrderTechnicians } from '../services/workOrderService'
import {
  defaultMaintenanceScheduleFilters,
  emptyMaintenanceScheduleFormValues,
  emptyMaintenanceScheduleWorkOrderValues,
  MAINTENANCE_SCHEDULE_STATUSES,
  type MaintenanceSchedule,
  type MaintenanceScheduleFormValues,
  type MaintenanceScheduleWorkOrderValues,
} from '../types/maintenanceSchedule'
import type { Vehicle } from '../types/vehicle'
import type { WorkOrderTechnician } from '../types/workOrder'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

function getWorkOrderDefaults(schedule: MaintenanceSchedule): MaintenanceScheduleWorkOrderValues {
  return {
    ...emptyMaintenanceScheduleWorkOrderValues,
    description: `${schedule.serviceType} for ${schedule.vehicle.registrationNumber}`,
    dueDate: schedule.nextDueDate ? schedule.nextDueDate.slice(0, 10) : '',
    priority: schedule.status === 'DUE' ? 'HIGH' : 'MEDIUM',
  }
}

export function MaintenanceSchedules() {
  const { error, filters, isLoading, reload, schedules, setFilters, summary } = useMaintenanceSchedules()
  const [formValues, setFormValues] = useState<MaintenanceScheduleFormValues>(emptyMaintenanceScheduleFormValues)
  const [editingSchedule, setEditingSchedule] = useState<MaintenanceSchedule | null>(null)
  const [workOrderSchedule, setWorkOrderSchedule] = useState<MaintenanceSchedule | null>(null)
  const [workOrderValues, setWorkOrderValues] = useState<MaintenanceScheduleWorkOrderValues>(emptyMaintenanceScheduleWorkOrderValues)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [technicians, setTechnicians] = useState<WorkOrderTechnician[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [optionsError, setOptionsError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadFormOptions = useCallback(async () => {
    await Promise.resolve()
    setIsOptionsLoading(true)
    setOptionsError('')

    try {
      const [vehicleList, technicianList] = await Promise.all([
        getVehicles({ category: '', fuelType: '', search: '', status: '' }),
        getWorkOrderTechnicians(),
      ])

      setVehicles(vehicleList)
      setTechnicians(technicianList)
    } catch (apiError) {
      setOptionsError(getApiErrorMessage(apiError, 'Unable to load maintenance schedule options.'))
    } finally {
      setIsOptionsLoading(false)
    }
  }, [])

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
    setFormValues(emptyMaintenanceScheduleFormValues)
    setEditingSchedule(null)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function openEditForm(schedule: MaintenanceSchedule) {
    setFormValues(toMaintenanceScheduleFormValues(schedule))
    setEditingSchedule(schedule)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingSchedule(null)
    setFormValues(emptyMaintenanceScheduleFormValues)
    setFormError('')
  }

  function openWorkOrderPanel(schedule: MaintenanceSchedule) {
    setWorkOrderSchedule(schedule)
    setWorkOrderValues(getWorkOrderDefaults(schedule))
    setFormError('')
    setSuccessMessage('')
  }

  function closeWorkOrderPanel() {
    setWorkOrderSchedule(null)
    setWorkOrderValues(emptyMaintenanceScheduleWorkOrderValues)
  }

  function clearFilters() {
    setFilters(defaultMaintenanceScheduleFilters)
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      if (editingSchedule) {
        await updateMaintenanceSchedule(editingSchedule.id, formValues)
        setSuccessMessage('Maintenance schedule updated successfully.')
      } else {
        await createMaintenanceSchedule(formValues)
        setSuccessMessage('Maintenance schedule created successfully.')
      }

      closeForm()
      await Promise.all([reload(), loadFormOptions()])
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to save maintenance schedule. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(schedule: MaintenanceSchedule) {
    const confirmed = window.confirm(`Delete ${schedule.serviceType} for ${schedule.vehicle.registrationNumber}?`)

    if (!confirmed) {
      return
    }

    setFormError('')
    setSuccessMessage('')

    try {
      const result = await deleteMaintenanceSchedule(schedule.id)
      setSuccessMessage(
        result.action === 'deleted'
          ? 'Maintenance schedule deleted successfully.'
          : 'Schedule had linked work orders, so it was cancelled instead.',
      )
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to delete maintenance schedule.'))
    }
  }

  async function handleCreateWorkOrder() {
    if (!workOrderSchedule) {
      return
    }

    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      await createWorkOrderFromSchedule(workOrderSchedule.id, workOrderValues)
      setSuccessMessage('Work order created from maintenance schedule.')
      closeWorkOrderPanel()
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to create work order from this schedule.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Maintenance schedules</span>
          <h2 className="dashboard-title">Preventive maintenance planner</h2>
          <p className="dashboard-subtitle">
            Plan service by date or odometer, spot due vehicles early, and turn planned maintenance into work orders.
          </p>
        </div>
        <button className="btn btn-success module-primary-action" type="button" onClick={openCreateForm}>
          Add Schedule
        </button>
      </div>

      {(error || formError || optionsError || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || formError || optionsError || error}
        </div>
      )}

      <div className="dashboard-grid maintenance-summary-grid">
        <SummaryCard helperText="Schedules ready for service" isLoading={isLoading} label="Due Now" tone="warning" value={summary.due} />
        <SummaryCard helperText="Future maintenance plans" isLoading={isLoading} label="Active Plans" tone="success" value={summary.active} />
        <SummaryCard helperText="Converted or completed plans" isLoading={isLoading} label="Completed" tone="neutral" value={summary.completed} />
        <SummaryCard helperText="Stopped maintenance plans" isLoading={isLoading} label="Cancelled" tone="danger" value={summary.cancelled} />
      </div>

      {isFormOpen ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">{editingSchedule ? 'Edit schedule' : 'New schedule'}</span>
              <h3>{editingSchedule ? editingSchedule.serviceType : 'Create maintenance plan'}</h3>
            </div>
          </div>
          <MaintenanceScheduleForm
            isLoadingOptions={isOptionsLoading}
            isSubmitting={isSubmitting}
            submitLabel={editingSchedule ? 'Update schedule' : 'Create schedule'}
            values={formValues}
            vehicles={vehicles}
            onCancel={closeForm}
            onChange={setFormValues}
            onSubmit={handleSubmit}
          />
        </section>
      ) : null}

      {workOrderSchedule ? (
        <CreateWorkOrderFromScheduleModal
          isLoadingOptions={isOptionsLoading}
          isSubmitting={isSubmitting}
          schedule={workOrderSchedule}
          technicians={technicians}
          values={workOrderValues}
          onCancel={closeWorkOrderPanel}
          onChange={setWorkOrderValues}
          onSubmit={handleCreateWorkOrder}
        />
      ) : null}

      <section className="module-panel">
        <div className="maintenance-schedule-toolbar">
          <div>
            <label className="form-label" htmlFor="maintenanceVehicleFilter">
              Vehicle
            </label>
            <select
              className="form-select"
              id="maintenanceVehicleFilter"
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
            <label className="form-label" htmlFor="maintenanceStatusFilter">
              Status
            </label>
            <select
              className="form-select"
              id="maintenanceStatusFilter"
              value={filters.status}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, status: event.target.value as typeof filters.status }))}
              disabled={filters.dueOnly}
            >
              <option value="">All statuses</option>
              {MAINTENANCE_SCHEDULE_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div className="maintenance-due-filter">
            <label className="form-label" htmlFor="maintenanceDueOnly">
              Focus
            </label>
            <label className="maintenance-check">
              <input
                id="maintenanceDueOnly"
                type="checkbox"
                checked={filters.dueOnly}
                onChange={(event) =>
                  setFilters((currentFilters) => ({
                    ...currentFilters,
                    dueOnly: event.target.checked,
                    status: event.target.checked ? '' : currentFilters.status,
                  }))
                }
              />
              Due only
            </label>
          </div>

          <div className="maintenance-schedule-toolbar-action">
            <button className="btn btn-outline-secondary" type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <MaintenanceScheduleTable
          isLoading={isLoading}
          schedules={schedules}
          onCreateWorkOrder={openWorkOrderPanel}
          onDelete={handleDelete}
          onEdit={openEditForm}
        />
      </section>
    </>
  )
}
