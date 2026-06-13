import type { FormEvent } from 'react'
import type { Vehicle } from '../../types/vehicle'
import {
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STATUSES,
  type WorkOrderFormValues,
  type WorkOrderTechnician,
} from '../../types/workOrder'

type WorkOrderFormProps = {
  isLoadingOptions: boolean
  isSubmitting: boolean
  onCancel: () => void
  onChange: (values: WorkOrderFormValues) => void
  onSubmit: () => Promise<void>
  submitLabel: string
  technicians: WorkOrderTechnician[]
  values: WorkOrderFormValues
  vehicles: Vehicle[]
}

export function WorkOrderForm({
  isLoadingOptions,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  submitLabel,
  technicians,
  values,
  vehicles,
}: WorkOrderFormProps) {
  function updateField(field: keyof WorkOrderFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="work-order-form" onSubmit={handleSubmit}>
      <div className="work-order-form-grid">
        <div>
          <label className="form-label" htmlFor="workOrderVehicle">
            Vehicle
          </label>
          <select
            className="form-select"
            id="workOrderVehicle"
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
          <label className="form-label" htmlFor="workOrderTechnician">
            Technician
          </label>
          <select
            className="form-select"
            id="workOrderTechnician"
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
          <label className="form-label" htmlFor="workOrderPriority">
            Priority
          </label>
          <select
            className="form-select"
            id="workOrderPriority"
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
          <label className="form-label" htmlFor="workOrderStatus">
            Status
          </label>
          <select
            className="form-select"
            id="workOrderStatus"
            value={values.status}
            onChange={(event) => updateField('status', event.target.value)}
            disabled={isSubmitting}
          >
            {WORK_ORDER_STATUSES.map((status) => (
              <option key={status.value} value={status.value}>
                {status.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="workOrderServiceType">
            Service type
          </label>
          <input
            className="form-control"
            id="workOrderServiceType"
            value={values.serviceType}
            onChange={(event) => updateField('serviceType', event.target.value)}
            placeholder="Oil change"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="workOrderDueDate">
            Due date
          </label>
          <input
            className="form-control"
            id="workOrderDueDate"
            type="date"
            value={values.dueDate}
            onChange={(event) => updateField('dueDate', event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div className="work-order-form-wide">
          <label className="form-label" htmlFor="workOrderDescription">
            Description
          </label>
          <textarea
            className="form-control"
            id="workOrderDescription"
            rows={3}
            value={values.description}
            onChange={(event) => updateField('description', event.target.value)}
            placeholder="Describe the maintenance work required"
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="workOrderLaborHours">
            Labor hours
          </label>
          <input
            className="form-control"
            id="workOrderLaborHours"
            type="number"
            min="0"
            step="0.25"
            value={values.laborHours}
            onChange={(event) => updateField('laborHours', event.target.value)}
            disabled={isSubmitting}
            placeholder="0"
          />
        </div>

        <div>
          <label className="form-label" htmlFor="workOrderCost">
            Cost
          </label>
          <input
            className="form-control"
            id="workOrderCost"
            type="number"
            min="0"
            step="0.01"
            value={values.cost}
            onChange={(event) => updateField('cost', event.target.value)}
            disabled={isSubmitting}
            placeholder="0"
          />
        </div>

        <div className="work-order-form-wide">
          <label className="form-label" htmlFor="workOrderCompletionNotes">
            Completion notes
          </label>
          <textarea
            className="form-control"
            id="workOrderCompletionNotes"
            rows={3}
            value={values.completionNotes}
            onChange={(event) => updateField('completionNotes', event.target.value)}
            disabled={isSubmitting}
            placeholder="Repair notes, replaced parts, or follow-up work"
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
