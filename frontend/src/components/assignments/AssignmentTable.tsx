import { StatusBadge } from '../common/StatusBadge'
import type { AssignmentStatus, VehicleAssignment } from '../../types/assignment'

type AssignmentTableProps = {
  assignments: VehicleAssignment[]
  emptyDescription: string
  emptyTitle: string
  isLoading: boolean
  onEnd: (assignment: VehicleAssignment) => void
}

const statusDisplay: Record<AssignmentStatus, { label: string; tone: 'success' | 'neutral' }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  ENDED: { label: 'Ended', tone: 'neutral' },
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not ended'
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

export function AssignmentTable({ assignments, emptyDescription, emptyTitle, isLoading, onEnd }: AssignmentTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading assignment records...
      </div>
    )
  }

  if (assignments.length === 0) {
    return (
      <div className="vehicle-table-state">
        <h3>{emptyTitle}</h3>
        <p>{emptyDescription}</p>
      </div>
    )
  }

  return (
    <div className="vehicle-table-wrap assignment-table-wrap">
      <table className="table assignment-table align-middle mb-0">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Driver</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>Status</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => {
            const status = statusDisplay[assignment.status]

            return (
              <tr key={assignment.id}>
                <td>
                  <div className="vehicle-main-text">{assignment.vehicle.registrationNumber}</div>
                  <div className="vehicle-muted-text">
                    {assignment.vehicle.make} {assignment.vehicle.model}
                  </div>
                </td>
                <td>
                  <div className="vehicle-main-text">{assignment.driver.fullName}</div>
                  <div className="vehicle-muted-text">{assignment.driver.licenseNumber}</div>
                </td>
                <td>{formatDate(assignment.startDate)}</td>
                <td>{formatDate(assignment.endDate)}</td>
                <td>
                  <StatusBadge label={status.label} tone={status.tone} />
                </td>
                <td>
                  <div className="vehicle-actions">
                    {assignment.status === 'ACTIVE' ? (
                      <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onEnd(assignment)}>
                        End Assignment
                      </button>
                    ) : (
                      <span className="vehicle-muted-text">No action</span>
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
