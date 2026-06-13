import type { FormEvent } from 'react'
import { DOCUMENT_TYPE_OPTIONS, type ComplianceDocumentFormValues } from '../../types/complianceDocument'
import type { Vehicle } from '../../types/vehicle'

type ComplianceDocumentFormProps = {
  isLoadingOptions: boolean
  isSubmitting: boolean
  onCancel: () => void
  onChange: (values: ComplianceDocumentFormValues) => void
  onSubmit: () => Promise<void>
  submitLabel: string
  values: ComplianceDocumentFormValues
  vehicles: Vehicle[]
}

export function ComplianceDocumentForm({
  isLoadingOptions,
  isSubmitting,
  onCancel,
  onChange,
  onSubmit,
  submitLabel,
  values,
  vehicles,
}: ComplianceDocumentFormProps) {
  function updateField(field: keyof ComplianceDocumentFormValues, value: string) {
    onChange({ ...values, [field]: value })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="compliance-document-form" onSubmit={handleSubmit}>
      <div className="compliance-document-form-grid">
        <div>
          <label className="form-label" htmlFor="complianceVehicle">
            Vehicle
          </label>
          <select
            className="form-select"
            id="complianceVehicle"
            value={values.vehicleId}
            onChange={(event) => updateField('vehicleId', event.target.value)}
            disabled={isSubmitting || isLoadingOptions}
            required
          >
            <option value="">{isLoadingOptions ? 'Loading vehicles...' : 'Select vehicle'}</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="complianceDocumentType">
            Document type
          </label>
          <select
            className="form-select"
            id="complianceDocumentType"
            value={values.documentType}
            onChange={(event) => updateField('documentType', event.target.value)}
            disabled={isSubmitting}
            required
          >
            {DOCUMENT_TYPE_OPTIONS.map((documentType) => (
              <option key={documentType} value={documentType}>
                {documentType}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="form-label" htmlFor="complianceDocumentNumber">
            Document number
          </label>
          <input
            className="form-control"
            id="complianceDocumentNumber"
            value={values.documentNumber}
            onChange={(event) => updateField('documentNumber', event.target.value)}
            placeholder="Optional reference number"
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="complianceIssueDate">
            Issue date
          </label>
          <input
            className="form-control"
            id="complianceIssueDate"
            type="date"
            value={values.issueDate}
            onChange={(event) => updateField('issueDate', event.target.value)}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label className="form-label" htmlFor="complianceExpiryDate">
            Expiry date
          </label>
          <input
            className="form-control"
            id="complianceExpiryDate"
            type="date"
            value={values.expiryDate}
            onChange={(event) => updateField('expiryDate', event.target.value)}
            disabled={isSubmitting}
            required
          />
        </div>

        <div>
          <label className="form-label" htmlFor="complianceFilePath">
            File reference
          </label>
          <input
            className="form-control"
            id="complianceFilePath"
            value={values.filePath}
            onChange={(event) => updateField('filePath', event.target.value)}
            placeholder="Optional file name or URL"
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
