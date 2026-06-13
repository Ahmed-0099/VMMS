import { StatusBadge } from '../common/StatusBadge'
import type { ComplianceDocument, ComplianceDocumentStatus } from '../../types/complianceDocument'

type ComplianceDocumentTableProps = {
  documents: ComplianceDocument[]
  isLoading: boolean
  onDelete: (document: ComplianceDocument) => void
  onEdit: (document: ComplianceDocument) => void
}

const statusDisplay: Record<ComplianceDocumentStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  EXPIRED: { label: 'Expired', tone: 'danger' },
  EXPIRING_SOON: { label: 'Expiring Soon', tone: 'warning' },
  VALID: { label: 'Valid', tone: 'success' },
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function getDaysUntilExpiry(value: string, status: ComplianceDocumentStatus) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const expiryDate = new Date(value)
  expiryDate.setHours(0, 0, 0, 0)
  const diffInDays = Math.ceil((expiryDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (status === 'EXPIRED') {
    return `${Math.abs(diffInDays)} day${Math.abs(diffInDays) === 1 ? '' : 's'} overdue`
  }

  if (diffInDays === 0) {
    return 'Expires today'
  }

  return `${diffInDays} day${diffInDays === 1 ? '' : 's'} left`
}

function getExpiryTone(status: ComplianceDocumentStatus) {
  if (status === 'EXPIRED') {
    return 'danger'
  }

  if (status === 'EXPIRING_SOON') {
    return 'warning'
  }

  return 'normal'
}

export function ComplianceDocumentTable({ documents, isLoading, onDelete, onEdit }: ComplianceDocumentTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading compliance documents...
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="vehicle-table-state">
        <h3>No compliance documents found</h3>
        <p>Add a document record or adjust filters to review vehicle compliance.</p>
      </div>
    )
  }

  return (
    <div className="vehicle-table-wrap compliance-document-table-wrap">
      <table className="table compliance-document-table align-middle mb-0">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Document</th>
            <th>Document Number</th>
            <th>Issue Date</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>File</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {documents.map((document) => {
            const status = statusDisplay[document.status]
            const expiryTone = getExpiryTone(document.status)

            return (
              <tr key={document.id} className={`compliance-row-${expiryTone}`}>
                <td>
                  <div className="vehicle-main-text">{document.vehicle.registrationNumber}</div>
                  <div className="vehicle-muted-text">
                    {document.vehicle.make} {document.vehicle.model}
                  </div>
                </td>
                <td>
                  <div className="vehicle-main-text">{document.documentType}</div>
                  <div className="vehicle-muted-text">Vehicle compliance record</div>
                </td>
                <td>{document.documentNumber ?? 'Not set'}</td>
                <td>{formatDate(document.issueDate)}</td>
                <td>
                  <div className={`compliance-expiry-cell compliance-expiry-${expiryTone}`}>
                    <strong>{formatDate(document.expiryDate)}</strong>
                    <span>{getDaysUntilExpiry(document.expiryDate, document.status)}</span>
                  </div>
                </td>
                <td>
                  <StatusBadge label={status.label} tone={status.tone} />
                </td>
                <td>
                  {document.filePath ? (
                    <span className="compliance-file-reference">{document.filePath}</span>
                  ) : (
                    <span className="vehicle-muted-text">No file</span>
                  )}
                </td>
                <td>
                  <div className="vehicle-actions compliance-document-actions">
                    <button className="btn btn-sm btn-outline-success" type="button" onClick={() => onEdit(document)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onDelete(document)}>
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
