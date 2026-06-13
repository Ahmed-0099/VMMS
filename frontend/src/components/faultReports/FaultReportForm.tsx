import type { FormEvent } from 'react'
import type { AssignmentVehicleSummary } from '../../types/assignment'
import { FAULT_URGENCIES, type FaultReportFormValues } from '../../types/faultReport'

type FaultReportFormProps = {
  assignedVehicle: AssignmentVehicleSummary | null
  isSubmitting: boolean
  onChange: (values: FaultReportFormValues) => void
  onSubmit: () => Promise<void>
  values: FaultReportFormValues
}

function formatOdometer(value: number | null) {
  return value === null ? 'Not set' : `${value.toLocaleString()} km`
}

export function FaultReportForm({ assignedVehicle, isSubmitting, onChange, onSubmit, values }: FaultReportFormProps) {
  function updateField(field: keyof FaultReportFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="fault-report-form" onSubmit={handleSubmit}>
      {assignedVehicle ? (
        <div className="fault-report-assigned-strip">
          <div>
            <span>Assigned vehicle</span>
            <strong>{assignedVehicle.registrationNumber}</strong>
            <small>
              {assignedVehicle.make} {assignedVehicle.model}
            </small>
          </div>
          <div>
            <span>Current odometer</span>
            <strong>{formatOdometer(assignedVehicle.currentOdometer)}</strong>
          </div>
        </div>
      ) : null}

      <div className="fault-report-form-grid">
        <div>
          <label className="form-label" htmlFor="faultReportUrgency">
            Urgency
          </label>
          <select
            className="form-select"
            id="faultReportUrgency"
            value={values.urgency}
            onChange={(event) => updateField('urgency', event.target.value)}
            disabled={isSubmitting}
            required
          >
            {FAULT_URGENCIES.map((urgency) => (
              <option key={urgency.value} value={urgency.value}>
                {urgency.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="faultReportPhoto">
            Photo reference
          </label>
          <input
            className="form-control"
            id="faultReportPhoto"
            value={values.photoPath}
            onChange={(event) => updateField('photoPath', event.target.value)}
            placeholder="Optional file name or URL"
            disabled={isSubmitting}
          />
        </div>

        <div className="fault-report-form-wide">
          <label className="form-label" htmlFor="faultReportDescription">
            Description
          </label>
          <textarea
            className="form-control"
            id="faultReportDescription"
            rows={4}
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Describe the issue, noise, warning light, leak, or driving impact"
            disabled={isSubmitting}
            required
          />
        </div>
      </div>

      <div className="vehicle-form-actions">
        <button className="btn btn-success" type="submit" disabled={isSubmitting || !assignedVehicle}>
          {isSubmitting ? 'Submitting...' : 'Submit Fault Report'}
        </button>
      </div>
    </form>
  )
}
