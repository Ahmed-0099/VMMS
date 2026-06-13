import type { FormEvent } from 'react'
import {
  type MaintenanceSchedule,
  type MaintenanceScheduleWorkOrderValues,
} from '../../types/maintenanceSchedule'
import { WORK_ORDER_PRIORITIES, type WorkOrderTechnician } from '../../types/workOrder'

type CreateWorkOrderFromScheduleModalProps = {
  isLoadingOptions: boolean
  isSubmitting: boolean
  onCancel: () => void
  onChange: (values: MaintenanceScheduleWorkOrderValues) => void
  onSubmit: () => Promise<void>
  schedule: MaintenanceSchedule
  technicians: WorkOrderTechnician[]
  values: MaintenanceScheduleWorkOrderValues
}

function formatDate(value: string | null) {
  if (!value) {
    return 'No date trigger'
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function CreateWorkOrderFromScheduleModal({
  isLoadingOptions,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  schedule,
  technicians,
  values,
}: CreateWorkOrderFromScheduleModalProps) {
  function updateField(field: keyof MaintenanceScheduleWorkOrderValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <section className="module-panel maintenance-work-order-panel">
      <div className="module-panel-header">
        <div>
          <span className="section-kicker">Create work order</span>
          <h3>{schedule.vehicle.registrationNumber}</h3>
        </div>
        <button className="btn btn-outline-secondary btn-sm" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>

      <form className="maintenance-work-order-form" onSubmit={handleSubmit}>
        <div className="maintenance-work-order-context">
          <span>{schedule.status === 'DUE' ? 'Due maintenance' : 'Planned maintenance'}</span>
          <strong>{schedule.serviceType}</strong>
          <small>
            {formatDate(schedule.nextDueDate)} · Odometer trigger{' '}
            {schedule.nextDueOdometer === null ? 'not set' : schedule.nextDueOdometer.toLocaleString()}
          </small>
        </div>

        <div className="maintenance-work-order-grid">
          <div>
            <label className="form-label" htmlFor="maintenanceWorkOrderTechnician">
              Technician
            </label>
            <select
              className="form-select"
              id="maintenanceWorkOrderTechnician"
              value={values.technicianId}
              onChange={(event) => updateField('technicianId', event.target.value)}
              disabled={isSubmitting || isLoadingOptions}
            >
              <option value="">{isLoadingOptions ? 'Loading technicians...' : 'Unassigned'}</option>
              {technicians.map((technician) => (
                <option key={technician.id} value={technician.id} disabled={technician.status !== 'ACTIVE'}>
                  {technician.name} - {technician.email}
                  {technician.status !== 'ACTIVE' ? ' (Inactive)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="maintenanceWorkOrderPriority">
              Priority
            </label>
            <select
              className="form-select"
              id="maintenanceWorkOrderPriority"
              value={values.priority}
              onChange={(event) => updateField('priority', event.target.value)}
              disabled={isSubmitting}
            >
              {WORK_ORDER_PRIORITIES.map((priority) => (
                <option key={priority.value} value={priority.value}>
                  {priority.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="maintenanceWorkOrderDueDate">
              Due date
            </label>
            <input
              className="form-control"
              id="maintenanceWorkOrderDueDate"
              type="date"
              value={values.dueDate}
              onChange={(event) => updateField('dueDate', event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="maintenance-work-order-wide">
            <label className="form-label" htmlFor="maintenanceWorkOrderDescription">
              Work order description
            </label>
            <textarea
              className="form-control"
              id="maintenanceWorkOrderDescription"
              rows={3}
              value={values.description}
              onChange={(event) => updateField('description', event.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
        </div>

        <div className="vehicle-form-actions">
          <button className="btn btn-success" type="submit" disabled={isSubmitting || isLoadingOptions}>
            {isSubmitting ? 'Creating...' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </section>
  )
}
