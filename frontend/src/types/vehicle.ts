export type VehicleStatus = 'ACTIVE' | 'IN_MAINTENANCE' | 'OUT_OF_SERVICE'

export type VehicleRelationCounts = {
  assignments?: number
  maintenanceSchedules?: number
  workOrders?: number
  faultReports?: number
  fuelLogs?: number
  complianceDocuments?: number
}

export type VehicleAssignmentSummary = {
  id: string
  startDate: string
  endDate: string | null
  status: 'ACTIVE' | 'ENDED'
  driver: {
    id: string
    fullName: string
    licenseNumber: string
  }
}

export type Vehicle = {
  id: string
  registrationNumber: string
  make: string
  model: string
  year: number | null
  vin: string | null
  fuelType: string
  category: string | null
  currentOdometer: number | null
  status: VehicleStatus
  createdAt: string
  updatedAt: string
  assignments?: VehicleAssignmentSummary[]
  _count?: VehicleRelationCounts
}

export type VehicleFormValues = {
  registrationNumber: string
  make: string
  model: string
  year: string
  vin: string
  fuelType: string
  category: string
  currentOdometer: string
  status: VehicleStatus
}

export type VehicleFilters = {
  search: string
  status: '' | VehicleStatus
  fuelType: string
  category: string
}

export type VehicleListResponse = {
  vehicles: Vehicle[]
}

export type VehicleResponse = {
  vehicle: Vehicle
}

export type VehicleMutationResponse = {
  message: string
  vehicle: Vehicle
}

export type VehicleDeleteResponse = {
  message: string
}

export const VEHICLE_STATUSES: Array<{ label: string; value: VehicleStatus }> = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'In Maintenance', value: 'IN_MAINTENANCE' },
  { label: 'Out of Service', value: 'OUT_OF_SERVICE' },
]

export const emptyVehicleFormValues: VehicleFormValues = {
  category: '',
  currentOdometer: '',
  fuelType: '',
  make: '',
  model: '',
  registrationNumber: '',
  status: 'ACTIVE',
  vin: '',
  year: '',
}
