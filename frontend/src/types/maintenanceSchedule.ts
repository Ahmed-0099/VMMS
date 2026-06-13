import type { WorkOrderPriority, WorkOrderStatus, WorkOrderTechnician } from './workOrder'
import type { VehicleStatus } from './vehicle'

export type MaintenanceScheduleStatus = 'ACTIVE' | 'DUE' | 'COMPLETED' | 'CANCELLED'

export type MaintenanceScheduleVehicleSummary = {
  id: string
  registrationNumber: string
  make: string
  model: string
  currentOdometer: number | null
  status: VehicleStatus
}

export type MaintenanceScheduleWorkOrderSummary = {
  id: string
  priority: WorkOrderPriority
  serviceType: string
  status: WorkOrderStatus
  technician: WorkOrderTechnician | null
}

export type MaintenanceSchedule = {
  id: string
  vehicleId: string
  serviceType: string
  nextDueDate: string | null
  nextDueOdometer: number | null
  notes: string | null
  status: MaintenanceScheduleStatus
  createdAt: string
  updatedAt: string
  vehicle: MaintenanceScheduleVehicleSummary
  workOrders: MaintenanceScheduleWorkOrderSummary[]
  _count?: {
    workOrders?: number
  }
}

export type MaintenanceScheduleFormValues = {
  vehicleId: string
  serviceType: string
  nextDueDate: string
  nextDueOdometer: string
  notes: string
  status: MaintenanceScheduleStatus
}

export type MaintenanceScheduleWorkOrderValues = {
  technicianId: string
  priority: WorkOrderPriority
  dueDate: string
  description: string
}

export type MaintenanceScheduleFilters = {
  vehicleId: string
  status: '' | MaintenanceScheduleStatus
  dueOnly: boolean
}

export type MaintenanceScheduleSummary = {
  active: number
  cancelled: number
  completed: number
  due: number
  total: number
}

export type MaintenanceScheduleListResponse = {
  schedules: MaintenanceSchedule[]
}

export type MaintenanceScheduleMutationResponse = {
  message: string
  schedule: MaintenanceSchedule
}

export type MaintenanceScheduleDeleteResponse = {
  action: 'deleted' | 'cancelled'
  message: string
  schedule: MaintenanceSchedule | null
}

export type MaintenanceScheduleWorkOrderResponse = {
  message: string
  schedule: MaintenanceSchedule
  workOrder: MaintenanceScheduleWorkOrderSummary
}

export const MAINTENANCE_SCHEDULE_STATUSES: Array<{ label: string; value: MaintenanceScheduleStatus }> = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Due', value: 'DUE' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]

export const defaultMaintenanceScheduleFilters: MaintenanceScheduleFilters = {
  dueOnly: false,
  status: '',
  vehicleId: '',
}

export const emptyMaintenanceScheduleFormValues: MaintenanceScheduleFormValues = {
  nextDueDate: '',
  nextDueOdometer: '',
  notes: '',
  serviceType: '',
  status: 'ACTIVE',
  vehicleId: '',
}

export const emptyMaintenanceScheduleWorkOrderValues: MaintenanceScheduleWorkOrderValues = {
  description: '',
  dueDate: '',
  priority: 'MEDIUM',
  technicianId: '',
}
