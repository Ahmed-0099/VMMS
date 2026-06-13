import { useCallback, useEffect, useState } from 'react'
import { ComplianceDocumentForm } from '../components/complianceDocuments/ComplianceDocumentForm'
import { ComplianceDocumentTable } from '../components/complianceDocuments/ComplianceDocumentTable'
import { SummaryCard } from '../components/SummaryCard'
import { useComplianceDocuments } from '../hooks/useComplianceDocuments'
import {
  createComplianceDocument,
  deleteComplianceDocument,
  toComplianceDocumentFormValues,
  updateComplianceDocument,
} from '../services/complianceDocumentService'
import { getVehicles } from '../services/vehicleService'
import {
  COMPLIANCE_DOCUMENT_STATUSES,
  DOCUMENT_TYPE_OPTIONS,
  defaultComplianceDocumentFilters,
  emptyComplianceDocumentFormValues,
  type ComplianceDocument,
  type ComplianceDocumentFormValues,
} from '../types/complianceDocument'
import type { Vehicle } from '../types/vehicle'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

export function ComplianceDocuments() {
  const { documents, error, filters, isLoading, reload, setFilters, summary } = useComplianceDocuments()
  const [formValues, setFormValues] = useState<ComplianceDocumentFormValues>(emptyComplianceDocumentFormValues)
  const [editingDocument, setEditingDocument] = useState<ComplianceDocument | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [optionsError, setOptionsError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const loadFormOptions = useCallback(async () => {
    await Promise.resolve()
    setIsOptionsLoading(true)
    setOptionsError('')

    try {
      const vehicleList = await getVehicles({ category: '', fuelType: '', search: '', status: '' })
      setVehicles(vehicleList)
    } catch (apiError) {
      setOptionsError(getApiErrorMessage(apiError, 'Unable to load vehicle options for compliance documents.'))
    } finally {
      setIsOptionsLoading(false)
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadInitialOptions() {
      await Promise.resolve()

      if (!isMounted) {
        return
      }

      await loadFormOptions()
    }

    loadInitialOptions()

    return () => {
      isMounted = false
    }
  }, [loadFormOptions])

  function openCreateForm() {
    setFormValues(emptyComplianceDocumentFormValues)
    setEditingDocument(null)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function openEditForm(document: ComplianceDocument) {
    setFormValues(toComplianceDocumentFormValues(document))
    setEditingDocument(document)
    setFormError('')
    setSuccessMessage('')
    setIsFormOpen(true)
  }

  function closeForm() {
    setIsFormOpen(false)
    setEditingDocument(null)
    setFormValues(emptyComplianceDocumentFormValues)
    setFormError('')
  }

  function clearFilters() {
    setFilters(defaultComplianceDocumentFilters)
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      if (editingDocument) {
        await updateComplianceDocument(editingDocument.id, formValues)
        setSuccessMessage('Compliance document updated successfully.')
      } else {
        await createComplianceDocument(formValues)
        setSuccessMessage('Compliance document created successfully.')
      }

      closeForm()
      await Promise.all([reload(), loadFormOptions()])
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to save compliance document. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleDelete(document: ComplianceDocument) {
    const confirmed = window.confirm(`Delete ${document.documentType} for ${document.vehicle.registrationNumber}?`)

    if (!confirmed) {
      return
    }

    setFormError('')
    setSuccessMessage('')

    try {
      await deleteComplianceDocument(document.id)
      setSuccessMessage('Compliance document deleted successfully.')
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to delete compliance document.'))
    }
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Compliance documents</span>
          <h2 className="dashboard-title">Vehicle compliance control</h2>
          <p className="dashboard-subtitle">
            Track registration, insurance, permits, and expiry risk before documents interrupt fleet operations.
          </p>
        </div>
        <button className="btn btn-success module-primary-action" type="button" onClick={openCreateForm}>
          Add Document
        </button>
      </div>

      {(error || formError || optionsError || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || formError || optionsError || error}
        </div>
      )}

      <div className="dashboard-grid compliance-summary-grid">
        <SummaryCard helperText="Documents currently clear" isLoading={isLoading} label="Valid" tone="success" value={summary.valid} />
        <SummaryCard
          helperText="Need renewal within 30 days"
          isLoading={isLoading}
          label="Expiring Soon"
          tone="warning"
          value={summary.expiringSoon}
        />
        <SummaryCard helperText="Already past expiry" isLoading={isLoading} label="Expired" tone="danger" value={summary.expired} />
        <SummaryCard helperText="Records after filters" isLoading={isLoading} label="Total Documents" tone="neutral" value={summary.total} />
      </div>

      {isFormOpen ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">{editingDocument ? 'Edit document' : 'New document'}</span>
              <h3>{editingDocument ? editingDocument.documentType : 'Add compliance record'}</h3>
            </div>
          </div>
          <ComplianceDocumentForm
            isLoadingOptions={isOptionsLoading}
            isSubmitting={isSubmitting}
            submitLabel={editingDocument ? 'Update document' : 'Create document'}
            values={formValues}
            vehicles={vehicles}
            onCancel={closeForm}
            onChange={setFormValues}
            onSubmit={handleSubmit}
          />
        </section>
      ) : null}

      <section className="module-panel">
        <div className="compliance-document-toolbar">
          <div>
            <label className="form-label" htmlFor="complianceVehicleFilter">
              Vehicle
            </label>
            <select
              className="form-select"
              id="complianceVehicleFilter"
              value={filters.vehicleId}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, vehicleId: event.target.value }))}
            >
              <option value="">All vehicles</option>
              {vehicles.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="complianceStatusFilter">
              Status
            </label>
            <select
              className="form-select"
              id="complianceStatusFilter"
              value={filters.status}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, status: event.target.value as typeof filters.status }))}
            >
              <option value="">All statuses</option>
              {COMPLIANCE_DOCUMENT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="complianceTypeFilter">
              Document type
            </label>
            <select
              className="form-select"
              id="complianceTypeFilter"
              value={filters.documentType}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, documentType: event.target.value }))}
            >
              <option value="">All document types</option>
              {DOCUMENT_TYPE_OPTIONS.map((documentType) => (
                <option key={documentType} value={documentType}>
                  {documentType}
                </option>
              ))}
            </select>
          </div>

          <div className="compliance-document-toolbar-action">
            <button className="btn btn-outline-secondary" type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <ComplianceDocumentTable documents={documents} isLoading={isLoading} onDelete={handleDelete} onEdit={openEditForm} />
      </section>
    </>
  )
}
