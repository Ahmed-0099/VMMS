import { StatusBadge } from '../common/StatusBadge'
import type {
  MaintenanceSchedule,
  MaintenanceScheduleStatus,
} from '../../types/maintenanceSchedule'

type MaintenanceScheduleTableProps = {
  isLoading: boolean
  onCreateWorkOrder: (schedule: MaintenanceSchedule) => void
  onDelete: (schedule: MaintenanceSchedule) => void
  onEdit: (schedule: MaintenanceSchedule) => void
  schedules: MaintenanceSchedule[]
}

const statusDisplay: Record<MaintenanceScheduleStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  ACTIVE: { label: 'Active', tone: 'success' },
  CANCELLED: { label: 'Cancelled', tone: 'danger' },
  COMPLETED: { label: 'Completed', tone: 'neutral' },
  DUE: { label: 'Due', tone: 'warning' },
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function getScheduleTone(status: MaintenanceScheduleStatus) {
  if (status === 'DUE') {
    return 'warning'
  }

  if (status === 'CANCELLED') {
    return 'danger'
  }

  if (status === 'COMPLETED') {
    return 'completed'
  }

  return 'normal'
}

function getOdometerText(value: number | null) {
  return value === null ? 'Not set' : value.toLocaleString()
}

function getLatestWorkOrderText(schedule: MaintenanceSchedule) {
  if (schedule.workOrders.length === 0) {
    return 'No linked work orders'
  }

  const latestWorkOrder = schedule.workOrders[0]
  return `${latestWorkOrder.serviceType} · ${latestWorkOrder.status.replaceAll('_', ' ')}`
}

export function MaintenanceScheduleTable({
  isLoading,
  onCreateWorkOrder,
  onDelete,
  onEdit,
  schedules,
}: MaintenanceScheduleTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading maintenance schedules...
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="vehicle-table-state">
        <h3>No maintenance schedules found</h3>
        <p>Create a preventive schedule or adjust filters to review vehicle service planning.</p>
      </div>
    )
  }

  return (
    <div className="vehicle-table-wrap maintenance-schedule-table-wrap">
      <table className="table maintenance-schedule-table align-middle mb-0">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Service</th>
            <th>Next Due Date</th>
            <th>Odometer Trigger</th>
            <th>Status</th>
            <th>Linked Work</th>
            <th>Notes</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((schedule) => {
            const status = statusDisplay[schedule.status]
            const rowTone = getScheduleTone(schedule.status)
            const canCreateWorkOrder = schedule.status === 'ACTIVE' || schedule.status === 'DUE'

            return (
              <tr key={schedule.id} className={`maintenance-row-${rowTone}`}>
                <td>
                  <div className="vehicle-main-text">{schedule.vehicle.registrationNumber}</div>
                  <div className="vehicle-muted-text">
                    {schedule.vehicle.make} {schedule.vehicle.model}
                  </div>
                </td>
                <td>
                  <div className="vehicle-main-text">{schedule.serviceType}</div>
                  <div className="vehicle-muted-text">Preventive maintenance</div>
                </td>
                <td>
                  <span className="maintenance-due-value">{formatDate(schedule.nextDueDate)}</span>
                </td>
                <td>
                  <div className="vehicle-main-text">{getOdometerText(schedule.nextDueOdometer)}</div>
                  <div className="vehicle-muted-text">Current {getOdometerText(schedule.vehicle.currentOdometer)}</div>
                </td>
                <td>
                  <StatusBadge label={status.label} tone={status.tone} />
                </td>
                <td>
                  <div className="vehicle-main-text">{schedule._count?.workOrders ?? schedule.workOrders.length}</div>
                  <div className="vehicle-muted-text">{getLatestWorkOrderText(schedule)}</div>
                </td>
                <td>
                  <span className="maintenance-notes">{schedule.notes || 'No notes'}</span>
                </td>
                <td>
                  <div className="vehicle-actions maintenance-schedule-actions">
                    <button
                      className="btn btn-sm btn-outline-primary"
                      type="button"
                      onClick={() => onCreateWorkOrder(schedule)}
                      disabled={!canCreateWorkOrder}
                    >
                      Create Work Order
                    </button>
                    <button className="btn btn-sm btn-outline-success" type="button" onClick={() => onEdit(schedule)}>
                      Edit
                    </button>
                    <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onDelete(schedule)}>
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
