import type { WorkOrderStatus } from '../../types/workOrder'
import type { RoleName } from '../../types/auth'

type WorkOrderStatusActionsProps = {
  currentRole: RoleName
  isUpdating: boolean
  onChangeStatus: (status: WorkOrderStatus) => void
  status: WorkOrderStatus
}

const nextStatusOptions: Record<WorkOrderStatus, Array<{ label: string; value: WorkOrderStatus }>> = {
  OPEN: [{ label: 'Start', value: 'IN_PROGRESS' }],
  IN_PROGRESS: [
    { label: 'Pending Parts', value: 'PENDING_PARTS' },
    { label: 'Complete', value: 'COMPLETED' },
  ],
  PENDING_PARTS: [{ label: 'Resume', value: 'IN_PROGRESS' }],
  COMPLETED: [{ label: 'Close', value: 'CLOSED' }],
  CLOSED: [],
}

export function WorkOrderStatusActions({ currentRole, isUpdating, onChangeStatus, status }: WorkOrderStatusActionsProps) {
  const options = nextStatusOptions[status].filter((option) => currentRole === 'ADMIN' || option.value !== 'CLOSED')

  if (options.length === 0) {
    return <span className="vehicle-muted-text">No status action</span>
  }

  return (
    <div className="work-order-status-actions">
      {options.map((option) => (
        <button
          key={option.value}
          className="btn btn-sm btn-outline-success"
          type="button"
          disabled={isUpdating}
          onClick={() => onChangeStatus(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
