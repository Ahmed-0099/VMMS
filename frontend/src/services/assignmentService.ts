import { api } from './api'
import type {
  AssignmentFilters,
  AssignmentFormValues,
  AssignmentListResponse,
  AssignmentResponse,
  MyActiveAssignmentResponse,
} from '../types/assignment'

function getAssignmentPayload(values: AssignmentFormValues) {
  return {
    driverId: values.driverId,
    startDate: values.startDate,
    vehicleId: values.vehicleId,
  }
}

function getAssignmentParams(filters: AssignmentFilters) {
  return {
    driverId: filters.driverId || undefined,
    status: filters.status || undefined,
    vehicleId: filters.vehicleId || undefined,
  }
}

export async function getAssignments(filters: AssignmentFilters) {
  const response = await api.get<AssignmentListResponse>('/assignments', {
    params: getAssignmentParams(filters),
  })

  return response.data.assignments
}

export async function getMyActiveAssignment() {
  const response = await api.get<MyActiveAssignmentResponse>('/assignments/my-active')
  return response.data
}

export async function createAssignment(values: AssignmentFormValues) {
  const response = await api.post<AssignmentResponse>('/assignments', getAssignmentPayload(values))
  return response.data.assignment
}

export async function endAssignment(id: string, endDate?: string) {
  const response = await api.patch<AssignmentResponse>(`/assignments/${id}/end`, {
    endDate: endDate || undefined,
  })

  return response.data.assignment
}
