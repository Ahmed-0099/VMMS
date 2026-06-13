import { Link } from 'react-router-dom'
import { StatusBadge } from '../common/StatusBadge'
import { WorkOrderStatusActions } from './WorkOrderStatusActions'
import type { RoleName } from '../../types/auth'
import type { WorkOrder, WorkOrderPriority, WorkOrderStatus } from '../../types/workOrder'

type WorkOrderTableProps = {
  currentRole: RoleName
  isLoading: boolean
  isUpdatingStatus: boolean
  onDelete: (workOrder: WorkOrder) => void
  onEdit: (workOrder: WorkOrder) => void
  onStatusChange: (workOrder: WorkOrder, status: WorkOrderStatus) => void
  workOrders: WorkOrder[]
}

const statusDisplay: Record<WorkOrderStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  CLOSED: { label: 'Closed', tone: 'neutral' },
  COMPLETED: { label: 'Completed', tone: 'success' },
  IN_PROGRESS: { label: 'In Progress', tone: 'warning' },
  OPEN: { label: 'Open', tone: 'neutral' },
  PENDING_PARTS: { label: 'Pending Parts', tone: 'danger' },
}

const priorityDisplay: Record<WorkOrderPriority, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  HIGH: { label: 'High', tone: 'warning' },
  LOW: { label: 'Low', tone: 'neutral' },
  MEDIUM: { label: 'Medium', tone: 'success' },
  URGENT: { label: 'Urgent', tone: 'danger' },
}

function formatDate(value: string | null) {
  if (!value) {
    return 'Not set'
  }

  return new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
  }).format(new Date(value))
}

function getDueTone(value: string | null, status: WorkOrderStatus) {
  if (!value || status === 'CLOSED' || status === 'COMPLETED') {
    return 'normal'
  }

  const today = new Date()
  const dueDate = new Date(value)
  const diffInDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

  if (diffInDays < 0) {
    return 'overdue'
  }

  if (diffInDays <= 3) {
    return 'soon'
  }

  return 'normal'
}

export function WorkOrderTable({
  currentRole,
  isLoading,
  isUpdatingStatus,
  onDelete,
  onEdit,
  onStatusChange,
  workOrders,
}: WorkOrderTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading work orders...
      </div>
    )
  }

  if (workOrders.length === 0) {
    return (
      <div className="vehicle-table-state">
        <h3>No work orders found</h3>
        <p>Create a work order or adjust filters to see maintenance jobs.</p>
      </div>
    )
  }

  return (
    <div className="vehicle-table-wrap work-order-table-wrap">
      <table className="table work-order-table align-middle mb-0">
        <thead>
          <tr>
            <th>Vehicle</th>
            <th>Service</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Due Date</th>
            <th>Technician</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {workOrders.map((workOrder) => {
            const status = statusDisplay[workOrder.status]
            const priority = priorityDisplay[workOrder.priority]
            const dueTone = getDueTone(workOrder.dueDate, workOrder.status)

            return (
              <tr key={workOrder.id}>
                <td>
                  <div className="vehicle-main-text">{workOrder.vehicle.registrationNumber}</div>
                  <div className="vehicle-muted-text">
                    {workOrder.vehicle.make} {workOrder.vehicle.model}
                  </div>
                </td>
                <td>
                  <Link className="vehicle-reg-link" to={`/work-orders/${workOrder.id}`}>
                    {workOrder.serviceType}
                  </Link>
                  <div className="vehicle-muted-text">{workOrder.description.slice(0, 54)}</div>
                </td>
                <td>
                  <StatusBadge label={priority.label} tone={priority.tone} />
                </td>
                <td>
                  <StatusBadge label={status.label} tone={status.tone} />
                </td>
                <td>
                  <span className={`work-order-due work-order-due-${dueTone}`}>{formatDate(workOrder.dueDate)}</span>
                </td>
                <td>{workOrder.technician ? workOrder.technician.name : 'Unassigned'}</td>
                <td>
                  <div className="vehicle-actions work-order-actions">
                    <Link className="btn btn-sm btn-outline-secondary" to={`/work-orders/${workOrder.id}`}>
                      View
                    </Link>
                    <WorkOrderStatusActions
                      currentRole={currentRole}
                      status={workOrder.status}
                      isUpdating={isUpdatingStatus}
                      onChangeStatus={(statusValue) => onStatusChange(workOrder, statusValue)}
                    />
                    {currentRole === 'ADMIN' ? (
                      <>
                        <button className="btn btn-sm btn-outline-success" type="button" onClick={() => onEdit(workOrder)}>
                          Edit
                        </button>
                        <button className="btn btn-sm btn-outline-danger" type="button" onClick={() => onDelete(workOrder)}>
                          Delete
                        </button>
                      </>
                    ) : null}
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
