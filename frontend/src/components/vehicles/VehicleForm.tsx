import type { FormEvent } from 'react'
import { emptyVehicleFormValues, VEHICLE_STATUSES } from '../../types/vehicle'
import type { VehicleFormValues } from '../../types/vehicle'

type VehicleFormProps = {
  values: VehicleFormValues
  isSubmitting: boolean
  submitLabel: string
  onCancel: () => void
  onChange: (values: VehicleFormValues) => void
  onSubmit: () => Promise<void>
}

const fuelTypes = ['Petrol', 'Diesel', 'Hybrid', 'Electric', 'CNG']
const categories = ['Sedan', 'SUV', 'Van', 'Truck', 'Bus', 'Motorcycle']

export function VehicleForm({ values, isSubmitting, submitLabel, onCancel, onChange, onSubmit }: VehicleFormProps) {
  function updateField(field: keyof VehicleFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  function handleReset() {
    onChange(emptyVehicleFormValues)
    onCancel()
  }

  return (
    <form className="vehicle-form" onSubmit={handleSubmit}>
      <div className="vehicle-form-grid">
        <div>
          <label className="form-label" htmlFor="registrationNumber">
            Registration number
          </label>
          <input
            className="form-control"
            id="registrationNumber"
            value={values.registrationNumber}
            onChange={(event) => updateField('registrationNumber', event.target.value)}
            placeholder="ABC-123"
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="status">
            Status
          </label>
          <select
            className="form-select"
            id="status"
            value={values.status}
            onChange={(event) => updateField('status', event.target.value)}
          >
            {VEHICLE_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="make">
            Make
          </label>
          <input
            className="form-control"
            id="make"
            value={values.make}
            onChange={(event) => updateField('make', event.target.value)}
            placeholder="Toyota"
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="model">
            Model
          </label>
          <input
            className="form-control"
            id="model"
            value={values.model}
            onChange={(event) => updateField('model', event.target.value)}
            placeholder="Corolla"
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="year">
            Year
          </label>
          <input
            className="form-control"
            id="year"
            min="1900"
            type="number"
            value={values.year}
            onChange={(event) => updateField('year', event.target.value)}
            placeholder="2024"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="vin">
            VIN / chassis number
          </label>
          <input
            className="form-control"
            id="vin"
            value={values.vin}
            onChange={(event) => updateField('vin', event.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="fuelType">
            Fuel type
          </label>
          <input
            className="form-control"
            id="fuelType"
            list="fuelTypes"
            value={values.fuelType}
            onChange={(event) => updateField('fuelType', event.target.value)}
            placeholder="Diesel"
            required
          />
          <datalist id="fuelTypes">
            {fuelTypes.map((fuelType) => (
              <option key={fuelType} value={fuelType} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="form-label" htmlFor="category">
            Category
          </label>
          <input
            className="form-control"
            id="category"
            list="vehicleCategories"
            value={values.category}
            onChange={(event) => updateField('category', event.target.value)}
            placeholder="SUV"
          />
          <datalist id="vehicleCategories">
            {categories.map((category) => (
              <option key={category} value={category} />
            ))}
          </datalist>
        </div>

        <div>
          <label className="form-label" htmlFor="currentOdometer">
            Current odometer
          </label>
          <input
            className="form-control"
            id="currentOdometer"
            min="0"
            type="number"
            value={values.currentOdometer}
            onChange={(event) => updateField('currentOdometer', event.target.value)}
            placeholder="45000"
          />
        </div>
      </div>

      <div className="vehicle-form-actions">
        <button className="btn btn-success" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </button>
        <button className="btn btn-outline-secondary" type="button" onClick={handleReset} disabled={isSubmitting}>
          Cancel
        </button>
      </div>
    </form>
  )
}
