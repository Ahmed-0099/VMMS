import { api } from './api'
import type {
  WorkOrder,
  WorkOrderDeleteResponse,
  WorkOrderFilters,
  WorkOrderFormValues,
  WorkOrderListResponse,
  WorkOrderMutationResponse,
  WorkOrderProgressValues,
  WorkOrderResponse,
  WorkOrderStatus,
  WorkOrderTechniciansResponse,
} from '../types/workOrder'

function numberOrNull(value: string) {
  return value === '' ? null : Number(value)
}

function getWorkOrderPayload(values: WorkOrderFormValues) {
  return {
    completionNotes: values.completionNotes.trim() || null,
    cost: numberOrNull(values.cost),
    description: values.description.trim(),
    dueDate: values.dueDate || null,
    laborHours: numberOrNull(values.laborHours),
    maintenanceScheduleId: values.maintenanceScheduleId || null,
    priority: values.priority,
    serviceType: values.serviceType.trim(),
    status: values.status,
    technicianId: values.technicianId || null,
    vehicleId: values.vehicleId,
  }
}

function getWorkOrderProgressPayload(values: WorkOrderProgressValues) {
  return {
    completionNotes: values.completionNotes.trim() || null,
    cost: numberOrNull(values.cost),
    laborHours: numberOrNull(values.laborHours),
  }
}

function getWorkOrderParams(filters: WorkOrderFilters) {
  return {
    priority: filters.priority || undefined,
    status: filters.status || undefined,
    technicianId: filters.technicianId || undefined,
    vehicleId: filters.vehicleId || undefined,
  }
}

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : ''
}

export async function getWorkOrders(filters: WorkOrderFilters) {
  const response = await api.get<WorkOrderListResponse>('/work-orders', {
    params: getWorkOrderParams(filters),
  })

  return response.data.workOrders
}

export async function getWorkOrder(id: string) {
  const response = await api.get<WorkOrderResponse>(`/work-orders/${id}`)
  return response.data.workOrder
}

export async function getWorkOrderTechnicians() {
  const response = await api.get<WorkOrderTechniciansResponse>('/work-orders/technicians')
  return response.data.technicians
}

export async function createWorkOrder(values: WorkOrderFormValues) {
  const response = await api.post<WorkOrderMutationResponse>('/work-orders', getWorkOrderPayload(values))
  return response.data.workOrder
}

export async function updateWorkOrder(id: string, values: WorkOrderFormValues) {
  const response = await api.put<WorkOrderMutationResponse>(`/work-orders/${id}`, getWorkOrderPayload(values))
  return response.data.workOrder
}

export async function updateWorkOrderProgress(id: string, values: WorkOrderProgressValues) {
  const response = await api.put<WorkOrderMutationResponse>(`/work-orders/${id}`, getWorkOrderProgressPayload(values))
  return response.data.workOrder
}

export async function updateWorkOrderStatus(id: string, status: WorkOrderStatus) {
  const response = await api.patch<WorkOrderMutationResponse>(`/work-orders/${id}/status`, { status })
  return response.data.workOrder
}

export async function deleteWorkOrder(id: string) {
  const response = await api.delete<WorkOrderDeleteResponse>(`/work-orders/${id}`)
  return response.data
}

export function toWorkOrderFormValues(workOrder: WorkOrder): WorkOrderFormValues {
  return {
    completionNotes: workOrder.completionNotes ?? '',
    cost: workOrder.cost === null ? '' : String(workOrder.cost),
    description: workOrder.description,
    dueDate: toDateInputValue(workOrder.dueDate),
    laborHours: workOrder.laborHours === null ? '' : String(workOrder.laborHours),
    maintenanceScheduleId: workOrder.maintenanceScheduleId ?? '',
    priority: workOrder.priority,
    serviceType: workOrder.serviceType,
    status: workOrder.status,
    technicianId: workOrder.technicianId ?? '',
    vehicleId: workOrder.vehicleId,
  }
}

export function toWorkOrderProgressValues(workOrder: WorkOrder): WorkOrderProgressValues {
  return {
    completionNotes: workOrder.completionNotes ?? '',
    cost: workOrder.cost === null ? '' : String(workOrder.cost),
    laborHours: workOrder.laborHours === null ? '' : String(workOrder.laborHours),
  }
}
