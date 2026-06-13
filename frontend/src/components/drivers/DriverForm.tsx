import type { FormEvent } from 'react'
import { DRIVER_STATUSES, emptyDriverFormValues } from '../../types/driver'
import type { DriverFormValues, DriverUserOption } from '../../types/driver'

type DriverFormProps = {
  values: DriverFormValues
  isSubmitting: boolean
  isLoadingDriverUsers: boolean
  linkedDriverOptions: DriverUserOption[]
  submitLabel: string
  currentDriverId?: string | null
  onCancel: () => void
  onChange: (values: DriverFormValues) => void
  onSubmit: () => Promise<void>
}

function getDriverUserLabel(option: DriverUserOption) {
  const statusLabel = option.status === 'INACTIVE' ? ' (Inactive)' : ''
  const linkedLabel = option.driverProfile ? ` - linked to ${option.driverProfile.fullName}` : ''

  return `${option.name} - ${option.email}${statusLabel}${linkedLabel}`
}

export function DriverForm({
  values,
  isSubmitting,
  isLoadingDriverUsers,
  linkedDriverOptions,
  submitLabel,
  currentDriverId = null,
  onCancel,
  onChange,
  onSubmit,
}: DriverFormProps) {
  function updateField(field: keyof DriverFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  function handleReset() {
    onChange(emptyDriverFormValues)
    onCancel()
  }

  function isLinkedToAnotherDriver(option: DriverUserOption) {
    return Boolean(option.driverProfile && option.driverProfile.id !== currentDriverId)
  }

  return (
    <form className="driver-form" onSubmit={handleSubmit}>
      <div className="driver-form-grid">
        <div>
          <label className="form-label" htmlFor="fullName">
            Full name
          </label>
          <input
            className="form-control"
            id="fullName"
            value={values.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            placeholder="Ahmed Khan"
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="licenseNumber">
            License number
          </label>
          <input
            className="form-control"
            id="licenseNumber"
            value={values.licenseNumber}
            onChange={(event) => updateField('licenseNumber', event.target.value)}
            placeholder="LIC-12345"
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="licenseExpiry">
            License expiry
          </label>
          <input
            className="form-control"
            id="licenseExpiry"
            type="date"
            value={values.licenseExpiry}
            onChange={(event) => updateField('licenseExpiry', event.target.value)}
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
            {DRIVER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="cnic">
            CNIC / national ID
          </label>
          <input
            className="form-control"
            id="cnic"
            value={values.cnic}
            onChange={(event) => updateField('cnic', event.target.value)}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="phone">
            Phone
          </label>
          <input
            className="form-control"
            id="phone"
            value={values.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            placeholder="+92 300 1234567"
          />
        </div>

        <div className="driver-link-field">
          <label className="form-label" htmlFor="userId">
            Linked Driver
          </label>
          <select
            className="form-select"
            id="userId"
            value={values.userId}
            onChange={(event) => updateField('userId', event.target.value)}
            disabled={isSubmitting || isLoadingDriverUsers}
          >
            <option value="">{isLoadingDriverUsers ? 'Loading driver accounts...' : 'No linked driver account'}</option>
            {linkedDriverOptions.map((option) => (
              <option key={option.id} value={option.id} disabled={isLinkedToAnotherDriver(option)}>
                {getDriverUserLabel(option)}
              </option>
            ))}
          </select>
        </div>

        <div className="driver-form-wide">
          <label className="form-label" htmlFor="address">
            Address
          </label>
          <textarea
            className="form-control"
            id="address"
            rows={2}
            value={values.address}
            onChange={(event) => updateField('address', event.target.value)}
            placeholder="Optional address"
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
