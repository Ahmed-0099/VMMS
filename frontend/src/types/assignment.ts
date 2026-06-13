import type { DriverStatus } from './driver'
import type { VehicleStatus } from './vehicle'

export type AssignmentStatus = 'ACTIVE' | 'ENDED'

export type AssignmentVehicleSummary = {
  id: string
  registrationNumber: string
  make: string
  model: string
  status: VehicleStatus
  currentOdometer: number | null
}

export type AssignmentDriverSummary = {
  id: string
  fullName: string
  licenseNumber: string
  phone: string | null
  status: DriverStatus
  userId: string | null
  user: {
    id: string
    name: string
    email: string
  } | null
}

export type VehicleAssignment = {
  id: string
  vehicleId: string
  driverId: string
  startDate: string
  endDate: string | null
  status: AssignmentStatus
  createdAt: string
  updatedAt: string
  vehicle: AssignmentVehicleSummary
  driver: AssignmentDriverSummary
}

export type AssignmentFormValues = {
  vehicleId: string
  driverId: string
  startDate: string
}

export type AssignmentFilters = {
  status: '' | AssignmentStatus
  vehicleId: string
  driverId: string
}

export type AssignmentListResponse = {
  assignments: VehicleAssignment[]
}

export type AssignmentResponse = {
  message: string
  assignment: VehicleAssignment
}

export type MyActiveAssignmentResponse = {
  message: string
  assignment: VehicleAssignment | null
}

export const ASSIGNMENT_STATUSES: Array<{ label: string; value: AssignmentStatus }> = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Ended', value: 'ENDED' },
]

export const emptyAssignmentFormValues: AssignmentFormValues = {
  driverId: '',
  startDate: new Date().toISOString().slice(0, 10),
  vehicleId: '',
}
