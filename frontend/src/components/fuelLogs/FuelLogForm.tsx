import type { FormEvent } from 'react'
import type { Driver } from '../../types/driver'
import { FUEL_TYPES, type FuelLogFormValues, type FuelLogVehicleSummary } from '../../types/fuelLog'
import type { Vehicle } from '../../types/vehicle'

type FuelLogFormProps = {
  drivers: Driver[]
  isLoadingOptions: boolean
  isSubmitting: boolean
  lockedVehicle: FuelLogVehicleSummary | null
  mode: 'admin' | 'driver'
  onCancel: () => void
  onChange: (values: FuelLogFormValues) => void
  onSubmit: () => Promise<void>
  submitLabel: string
  values: FuelLogFormValues
  vehicles: Vehicle[]
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', {
    currency: 'PKR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function calculateLiveTotal(values: FuelLogFormValues) {
  const quantity = Number(values.quantity)
  const unitCost = Number(values.unitCost)

  if (!Number.isFinite(quantity) || !Number.isFinite(unitCost) || quantity <= 0 || unitCost <= 0) {
    return 0
  }

  return quantity * unitCost
}

export function FuelLogForm({
  drivers,
  isLoadingOptions,
  isSubmitting,
  lockedVehicle,
  mode,
  onCancel,
  onChange,
  onSubmit,
  submitLabel,
  values,
  vehicles,
}: FuelLogFormProps) {
  function updateField(field: keyof FuelLogFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const liveTotal = calculateLiveTotal(values)

  return (
    <form className="fuel-log-form" onSubmit={handleSubmit}>
      {mode === 'driver' && lockedVehicle ? (
        <div className="fuel-log-assigned-strip">
          <div>
            <span>Assigned vehicle</span>
            <strong>{lockedVehicle.registrationNumber}</strong>
            <small>
              {lockedVehicle.make} {lockedVehicle.model} - {lockedVehicle.fuelType}
            </small>
          </div>
          <div>
            <span>Current odometer</span>
            <strong>{lockedVehicle.currentOdometer === null ? 'Not set' : `${lockedVehicle.currentOdometer.toLocaleString()} km`}</strong>
          </div>
        </div>
      ) : null}

      <div className="fuel-log-form-grid">
        {mode === 'admin' ? (
          <>
            <div>
              <label className="form-label" htmlFor="fuelLogVehicle">
                Vehicle
              </label>
              <select
                className="form-select"
                id="fuelLogVehicle"
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
              <label className="form-label" htmlFor="fuelLogDriver">
                Driver
              </label>
              <select
                className="form-select"
                id="fuelLogDriver"
                value={values.driverId}
                onChange={(event) => updateField('driverId', event.target.value)}
                disabled={isSubmitting || isLoadingOptions}
              >
                <option value="">{isLoadingOptions ? 'Loading drivers...' : 'No driver selected'}</option>
                {drivers.map((driver) => (
                  <option key={driver.id} value={driver.id}>
                    {driver.fullName} - {driver.licenseNumber}
                  </option>
                ))}
              </select>
            </div>
          </>
        ) : null}

        <div>
          <label className="form-label" htmlFor="fuelLogDate">
            Date
          </label>
          <input
            className="form-control"
            id="fuelLogDate"
            type="date"
            value={values.date}
            onChange={(event) => updateField('date', event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="fuelLogFuelType">
            Fuel type
          </label>
          <select
            className="form-select"
            id="fuelLogFuelType"
            value={values.fuelType}
            onChange={(event) => updateField('fuelType', event.target.value)}
            disabled={isSubmitting}
            required
          >
            {FUEL_TYPES.map((fuelType) => (
              <option key={fuelType} value={fuelType}>
                {fuelType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="fuelLogQuantity">
            Quantity
          </label>
          <input
            className="form-control"
            id="fuelLogQuantity"
            min="0.01"
            step="0.01"
            type="number"
            value={values.quantity}
            onChange={(event) => updateField('quantity', event.target.value)}
            placeholder="45"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="fuelLogUnitCost">
            Unit cost
          </label>
          <input
            className="form-control"
            id="fuelLogUnitCost"
            min="0.01"
            step="0.01"
            type="number"
            value={values.unitCost}
            onChange={(event) => updateField('unitCost', event.target.value)}
            placeholder="285"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="fuelLogOdometer">
            Odometer
          </label>
          <input
            className="form-control"
            id="fuelLogOdometer"
            min="0"
            step="1"
            type="number"
            value={values.odometerReading}
            onChange={(event) => updateField('odometerReading', event.target.value)}
            placeholder="52000"
            disabled={isSubmitting}
          />
        </div>

        <div className="fuel-log-total-card">
          <span>Calculated total</span>
          <strong>{formatCurrency(liveTotal)}</strong>
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
