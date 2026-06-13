import type { UserStatus } from './auth'
import type { VehicleStatus } from './vehicle'

export type WorkOrderPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'PENDING_PARTS' | 'COMPLETED' | 'CLOSED'

export type WorkOrderVehicleSummary = {
  id: string
  registrationNumber: string
  make: string
  model: string
  status: VehicleStatus
}

export type WorkOrderTechnician = {
  id: string
  name: string
  email: string
  status: UserStatus
  role?: {
    name: string
  }
}

export type WorkOrderMaintenanceScheduleSummary = {
  id: string
  serviceType: string
  status: string
}

export type WorkOrder = {
  id: string
  vehicleId: string
  technicianId: string | null
  maintenanceScheduleId: string | null
  priority: WorkOrderPriority
  status: WorkOrderStatus
  serviceType: string
  description: string
  dueDate: string | null
  laborHours: number | null
  cost: number | null
  completionNotes: string | null
  createdAt: string
  updatedAt: string
  vehicle: WorkOrderVehicleSummary
  technician: WorkOrderTechnician | null
  maintenanceSchedule: WorkOrderMaintenanceScheduleSummary | null
}

export type WorkOrderFormValues = {
  vehicleId: string
  technicianId: string
  maintenanceScheduleId: string
  priority: WorkOrderPriority
  status: WorkOrderStatus
  serviceType: string
  description: string
  dueDate: string
  laborHours: string
  cost: string
  completionNotes: string
}

export type WorkOrderProgressValues = {
  laborHours: string
  cost: string
  completionNotes: string
}

export type WorkOrderFilters = {
  status: '' | WorkOrderStatus
  priority: '' | WorkOrderPriority
  vehicleId: string
  technicianId: string
}

export type WorkOrderListResponse = {
  workOrders: WorkOrder[]
}

export type WorkOrderResponse = {
  workOrder: WorkOrder
}

export type WorkOrderMutationResponse = {
  message: string
  workOrder: WorkOrder
}

export type WorkOrderDeleteResponse = {
  message: string
}

export type WorkOrderTechniciansResponse = {
  technicians: WorkOrderTechnician[]
}

export const WORK_ORDER_PRIORITIES: Array<{ label: string; value: WorkOrderPriority }> = [
  { label: 'Low', value: 'LOW' },
  { label: 'Medium', value: 'MEDIUM' },
  { label: 'High', value: 'HIGH' },
  { label: 'Urgent', value: 'URGENT' },
]

export const WORK_ORDER_STATUSES: Array<{ label: string; value: WorkOrderStatus }> = [
  { label: 'Open', value: 'OPEN' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Pending Parts', value: 'PENDING_PARTS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Closed', value: 'CLOSED' },
]

export const emptyWorkOrderFormValues: WorkOrderFormValues = {
  completionNotes: '',
  cost: '',
  description: '',
  dueDate: '',
  laborHours: '',
  maintenanceScheduleId: '',
  priority: 'MEDIUM',
  serviceType: '',
  status: 'OPEN',
  technicianId: '',
  vehicleId: '',
}

export const emptyWorkOrderProgressValues: WorkOrderProgressValues = {
  completionNotes: '',
  cost: '',
  laborHours: '',
}
