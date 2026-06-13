import { api } from './api'
import type {
  MaintenanceSchedule,
  MaintenanceScheduleDeleteResponse,
  MaintenanceScheduleFilters,
  MaintenanceScheduleFormValues,
  MaintenanceScheduleListResponse,
  MaintenanceScheduleMutationResponse,
  MaintenanceScheduleWorkOrderResponse,
  MaintenanceScheduleWorkOrderValues,
} from '../types/maintenanceSchedule'

function numberOrNull(value: string) {
  return value === '' ? null : Number(value)
}

function getMaintenanceSchedulePayload(values: MaintenanceScheduleFormValues) {
  return {
    nextDueDate: values.nextDueDate || null,
    nextDueOdometer: numberOrNull(values.nextDueOdometer),
    notes: values.notes.trim() || null,
    serviceType: values.serviceType.trim(),
    status: values.status,
    vehicleId: values.vehicleId,
  }
}

function getMaintenanceScheduleParams(filters: MaintenanceScheduleFilters) {
  return {
    dueOnly: filters.dueOnly || undefined,
    status: filters.status || undefined,
    vehicleId: filters.vehicleId || undefined,
  }
}

function getWorkOrderPayload(values: MaintenanceScheduleWorkOrderValues) {
  return {
    description: values.description.trim(),
    dueDate: values.dueDate || null,
    priority: values.priority,
    technicianId: values.technicianId || null,
  }
}

function toDateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : ''
}

export async function getMaintenanceSchedules(filters: MaintenanceScheduleFilters) {
  const response = await api.get<MaintenanceScheduleListResponse>('/maintenance-schedules', {
    params: getMaintenanceScheduleParams(filters),
  })

  return response.data.schedules
}

export async function createMaintenanceSchedule(values: MaintenanceScheduleFormValues) {
  const response = await api.post<MaintenanceScheduleMutationResponse>('/maintenance-schedules', getMaintenanceSchedulePayload(values))
  return response.data.schedule
}

export async function updateMaintenanceSchedule(id: string, values: MaintenanceScheduleFormValues) {
  const response = await api.put<MaintenanceScheduleMutationResponse>(
    `/maintenance-schedules/${id}`,
    getMaintenanceSchedulePayload(values),
  )
  return response.data.schedule
}

export async function deleteMaintenanceSchedule(id: string) {
  const response = await api.delete<MaintenanceScheduleDeleteResponse>(`/maintenance-schedules/${id}`)
  return response.data
}

export async function createWorkOrderFromSchedule(id: string, values: MaintenanceScheduleWorkOrderValues) {
  const response = await api.post<MaintenanceScheduleWorkOrderResponse>(
    `/maintenance-schedules/${id}/create-work-order`,
    getWorkOrderPayload(values),
  )

  return response.data
}

export function toMaintenanceScheduleFormValues(schedule: MaintenanceSchedule): MaintenanceScheduleFormValues {
  return {
    nextDueDate: toDateInputValue(schedule.nextDueDate),
    nextDueOdometer: schedule.nextDueOdometer === null ? '' : String(schedule.nextDueOdometer),
    notes: schedule.notes ?? '',
    serviceType: schedule.serviceType,
    status: schedule.status,
    vehicleId: schedule.vehicleId,
  }
}
