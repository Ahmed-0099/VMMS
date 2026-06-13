import { Link } from 'react-router-dom'
import { StatusBadge } from '../common/StatusBadge'
import type { RoleName } from '../../types/auth'
import type { FaultReport, FaultReportStatus, FaultUrgency } from '../../types/faultReport'

type FaultReportTableProps = {
  currentRole: RoleName
  faultReports: FaultReport[]
  isLoading: boolean
  isUpdatingStatus: boolean
  onClose: (faultReport: FaultReport) => void
  onConvert: (faultReport: FaultReport) => void
  onReview: (faultReport: FaultReport) => void
}

const urgencyDisplay: Record<FaultUrgency, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  HIGH: { label: 'High', tone: 'danger' },
  LOW: { label: 'Low', tone: 'neutral' },
  MEDIUM: { label: 'Medium', tone: 'warning' },
}

const statusDisplay: Record<FaultReportStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  CLOSED: { label: 'Closed', tone: 'neutral' },
  CONVERTED_TO_WORK_ORDER: { label: 'Converted', tone: 'success' },
  NEW: { label: 'New', tone: 'danger' },
  REVIEWED: { label: 'Reviewed', tone: 'warning' },
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(value))
}

function getReporterLabel(faultReport: FaultReport) {
  if (faultReport.driver) {
    return {
      detail: faultReport.driver.user?.email ?? faultReport.driver.licenseNumber,
      name: faultReport.driver.fullName,
    }
  }

  if (faultReport.reporter) {
    return {
      detail: faultReport.reporter.email,
      name: faultReport.reporter.name,
    }
  }

  return {
    detail: 'No linked driver',
    name: 'Unknown reporter',
  }
}

function canConvert(faultReport: FaultReport) {
  return !faultReport.workOrderId && ['NEW', 'REVIEWED'].includes(faultReport.status)
}

export function FaultReportTable({
  currentRole,
  faultReports,
  isLoading,
  isUpdatingStatus,
  onClose,
  onConvert,
  onReview,
}: FaultReportTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading fault reports...
      </div>
    )
  }

  if (faultReports.length === 0) {
    return (
      <div className="vehicle-table-state">
        <h3>No fault reports found</h3>
        <p>Submit a report or adjust filters to see vehicle issue history.</p>
      </div>
    )
  }

  return (
    <div className="vehicle-table-wrap fault-report-table-wrap">
      <table className="table fault-report-table align-middle mb-0">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Reporter</th>
            <th>Urgency</th>
            <th>Status</th>
            <th>Description</th>
            <th>Reported</th>
            <th>Work Order</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {faultReports.map((faultReport) => {
            const urgency = urgencyDisplay[faultReport.urgency]
            const status = statusDisplay[faultReport.status]
            const reporter = getReporterLabel(faultReport)

            return (
              <tr key={faultReport.id} className={faultReport.urgency === 'HIGH' && faultReport.status !== 'CLOSED' ? 'fault-row-high' : ''}>
                <td>
                  <div className="vehicle-main-text">{faultReport.vehicle.registrationNumber}</div>
                  <div className="vehicle-muted-text">
                    {faultReport.vehicle.make} {faultReport.vehicle.model}
                  </div>
                </td>
                <td>
                  <div className="vehicle-main-text">{reporter.name}</div>
                  <div className="vehicle-muted-text">{reporter.detail}</div>
                </td>
                <td>
                  <StatusBadge label={urgency.label} tone={urgency.tone} />
                </td>
                <td>
                  <StatusBadge label={status.label} tone={status.tone} />
                </td>
                <td>
                  <div className="fault-report-description">{faultReport.description}</div>
                  {faultReport.photoPath ? <div className="vehicle-muted-text">Photo: {faultReport.photoPath}</div> : null}
                </td>
                <td>{formatDate(faultReport.createdAt)}</td>
                <td>
                  {faultReport.workOrder ? (
                    currentRole === 'ADMIN' ? (
                      <Link className="vehicle-reg-link" to={`/work-orders/${faultReport.workOrder.id}`}>
                        {faultReport.workOrder.serviceType}
                      </Link>
                    ) : (
                      <span className="vehicle-main-text">{faultReport.workOrder.serviceType}</span>
                    )
                  ) : (
                    <span className="vehicle-muted-text">Not converted</span>
                  )}
                </td>
                <td>
                  <div className="vehicle-actions fault-report-actions">
                    {currentRole === 'ADMIN' ? (
                      <>
                        {faultReport.status === 'NEW' ? (
                          <button className="btn btn-sm btn-outline-secondary" type="button" onClick={() => onReview(faultReport)} disabled={isUpdatingStatus}>
                            Review
                          </button>
                        ) : null}
                        {canConvert(faultReport) ? (
                          <button className="btn btn-sm btn-outline-success" type="button" onClick={() => onConvert(faultReport)}>
                            Convert
                          </button>
                        ) : null}
                        {['NEW', 'REVIEWED'].includes(faultReport.status) ? (
                          <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onClose(faultReport)} disabled={isUpdatingStatus}>
                            Close
                          </button>
                        ) : null}
                      </>
                    ) : (
                      <span className="vehicle-muted-text">Status only</span>
                    )}
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
