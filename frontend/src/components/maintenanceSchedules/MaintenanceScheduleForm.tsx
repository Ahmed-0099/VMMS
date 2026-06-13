import type { FormEvent } from 'react'
import {
  MAINTENANCE_SCHEDULE_STATUSES,
  type MaintenanceScheduleFormValues,
} from '../../types/maintenanceSchedule'
import type { Vehicle } from '../../types/vehicle'

type MaintenanceScheduleFormProps = {
  isLoadingOptions: boolean
  isSubmitting: boolean
  onCancel: () => void
  onChange: (values: MaintenanceScheduleFormValues) => void
  onSubmit: () => Promise<void>
  submitLabel: string
  values: MaintenanceScheduleFormValues
  vehicles: Vehicle[]
}

export function MaintenanceScheduleForm({
  isLoadingOptions,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  submitLabel,
  values,
  vehicles,
}: MaintenanceScheduleFormProps) {
  function updateField(field: keyof MaintenanceScheduleFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="maintenance-schedule-form" onSubmit={handleSubmit}>
      <div className="maintenance-schedule-form-grid">
        <div>
          <label className="form-label" htmlFor="maintenanceVehicle">
            Vehicle
          </label>
          <select
            className="form-select"
            id="maintenanceVehicle"
            value={values.vehicleId}
            onChange={(event) => updateField('vehicleId', event.target.value)}
            disabled={isSubmitting || isLoadingOptions}
            required
          >
            <option value="">{isLoadingOptions ? 'Loading vehicles...' : 'Select vehicle'}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id} disabled={vehicle.status === 'OUT_OF_SERVICE'}>
                {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                {vehicle.status === 'OUT_OF_SERVICE' ? ' (Out of service)' : ''}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="maintenanceServiceType">
            Service type
          </label>
          <input
            className="form-control"
            id="maintenanceServiceType"
            value={values.serviceType}
            onChange={(event) => updateField('serviceType', event.target.value)}
            placeholder="Oil change, brake service"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="maintenanceStatus">
            Status
          </label>
          <select
            className="form-select"
            id="maintenanceStatus"
            value={values.status}
            onChange={(event) => updateField('status', event.target.value)}
            disabled={isSubmitting}
          >
            {MAINTENANCE_SCHEDULE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="maintenanceNextDueDate">
            Next due date
          </label>
          <input
            className="form-control"
            id="maintenanceNextDueDate"
            type="date"
            value={values.nextDueDate}
            onChange={(event) => updateField('nextDueDate', event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="maintenanceNextDueOdometer">
            Next due odometer
          </label>
          <input
            className="form-control"
            id="maintenanceNextDueOdometer"
            type="number"
            min="0"
            value={values.nextDueOdometer}
            onChange={(event) => updateField('nextDueOdometer', event.target.value)}
            placeholder="52000"
            disabled={isSubmitting}
          />
        </div>

        <div className="maintenance-schedule-form-wide">
          <label className="form-label" htmlFor="maintenanceNotes">
            Notes
          </label>
          <textarea
            className="form-control"
            id="maintenanceNotes"
            rows={3}
            value={values.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            placeholder="Optional schedule notes"
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="vehicle-form-actions">
        <button className="btn btn-success" type="submit" disabled={isSubmitting || isLoadingOptions}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}
