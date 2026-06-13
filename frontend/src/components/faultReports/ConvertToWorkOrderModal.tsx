import type { FormEvent } from 'react'
import {
  WORK_ORDER_PRIORITIES,
  type WorkOrderTechnician,
} from '../../types/workOrder'
import type { FaultReport, FaultReportConvertValues } from '../../types/faultReport'

type ConvertToWorkOrderModalProps = {
  faultReport: FaultReport
  isLoadingOptions: boolean
  isSubmitting: boolean
  onCancel: () => void
  onChange: (values: FaultReportConvertValues) => void
  onSubmit: () => Promise<void>
  technicians: WorkOrderTechnician[]
  values: FaultReportConvertValues
}

export function ConvertToWorkOrderModal({
  faultReport,
  isLoadingOptions,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  technicians,
  values,
}: ConvertToWorkOrderModalProps) {
  function updateField(field: keyof FaultReportConvertValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <section className="module-panel fault-convert-panel">
      <div className="module-panel-header">
        <div>
          <span className="section-kicker">Convert to work order</span>
          <h3>{faultReport.vehicle.registrationNumber}</h3>
        </div>
        <button className="btn btn-outline-secondary btn-sm" type="button" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </button>
      </div>

      <form className="fault-convert-form" onSubmit={handleSubmit}>
        <div className="fault-convert-context">
          <span>{faultReport.urgency} urgency fault</span>
          <strong>{faultReport.description}</strong>
        </div>

        <div className="fault-convert-grid">
          <div>
            <label className="form-label" htmlFor="faultConvertServiceType">
              Service type
            </label>
            <input
              className="form-control"
              id="faultConvertServiceType"
              value={values.serviceType}
              onChange={(event) => updateField('serviceType', event.target.value)}
              placeholder="Fault inspection"
              disabled={isSubmitting}
              required
            />
          </div>

          <div>
            <label className="form-label" htmlFor="faultConvertTechnician">
              Technician
            </label>
            <select
              className="form-select"
              id="faultConvertTechnician"
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
            <label className="form-label" htmlFor="faultConvertPriority">
              Priority
            </label>
            <select
              className="form-select"
              id="faultConvertPriority"
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
            <label className="form-label" htmlFor="faultConvertDueDate">
              Due date
            </label>
            <input
              className="form-control"
              id="faultConvertDueDate"
              type="date"
              value={values.dueDate}
              onChange={(event) => updateField('dueDate', event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="fault-convert-wide">
            <label className="form-label" htmlFor="faultConvertDescription">
              Work order description
            </label>
            <textarea
              className="form-control"
              id="faultConvertDescription"
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
            {isSubmitting ? 'Converting...' : 'Create Work Order'}
          </button>
        </div>
      </form>
    </section>
  )
}
