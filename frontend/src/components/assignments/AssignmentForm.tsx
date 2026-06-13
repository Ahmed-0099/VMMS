import type { FormEvent } from 'react'
import type { AssignmentFormValues } from '../../types/assignment'
import type { Driver } from '../../types/driver'
import type { Vehicle } from '../../types/vehicle'

type AssignmentFormProps = {
  activeDriverIds: Set<string>
  activeVehicleIds: Set<string>
  drivers: Driver[]
  isLoadingOptions: boolean
  isSubmitting: boolean
  onCancel: () => void
  onChange: (values: AssignmentFormValues) => void
  onSubmit: () => Promise<void>
  values: AssignmentFormValues
  vehicles: Vehicle[]
}

export function AssignmentForm({
  activeDriverIds,
  activeVehicleIds,
  drivers,
  isLoadingOptions,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  values,
  vehicles,
}: AssignmentFormProps) {
  function updateField(field: keyof AssignmentFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="assignment-form" onSubmit={handleSubmit}>
      <div className="assignment-form-grid">
        <div>
          <label className="form-label" htmlFor="assignmentVehicle">
            Vehicle
          </label>
          <select
            className="form-select"
            id="assignmentVehicle"
            value={values.vehicleId}
            onChange={(event) => updateField('vehicleId', event.target.value)}
            disabled={isSubmitting || isLoadingOptions}
            required
          >
            <option value="">{isLoadingOptions ? 'Loading vehicles...' : 'Select active vehicle'}</option>
            {vehicles.map((vehicle) => {
              const isAssigned = activeVehicleIds.has(vehicle.id)

              return (
                <option key={vehicle.id} value={vehicle.id} disabled={isAssigned}>
                  {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                  {isAssigned ? ' (Already assigned)' : ''}
                </option>
              )
            })}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="assignmentDriver">
            Driver
          </label>
          <select
            className="form-select"
            id="assignmentDriver"
            value={values.driverId}
            onChange={(event) => updateField('driverId', event.target.value)}
            disabled={isSubmitting || isLoadingOptions}
            required
          >
            <option value="">{isLoadingOptions ? 'Loading drivers...' : 'Select active driver'}</option>
            {drivers.map((driver) => {
              const isAssigned = activeDriverIds.has(driver.id)

              return (
                <option key={driver.id} value={driver.id} disabled={isAssigned}>
                  {driver.fullName} - {driver.licenseNumber}
                  {isAssigned ? ' (Already assigned)' : ''}
                </option>
              )
            })}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="assignmentStartDate">
            Start date
          </label>
          <input
            className="form-control"
            id="assignmentStartDate"
            type="date"
            value={values.startDate}
            onChange={(event) => updateField('startDate', event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="vehicle-form-actions">
        <button className="btn btn-success" type="submit" disabled={isSubmitting || isLoadingOptions}>
          {isSubmitting ? 'Saving...' : 'Create assignment'}
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}
