export type DriverStatus = 'ACTIVE' | 'INACTIVE'

export type LinkedDriverUser = {
  id: string
  name: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  role: {
    name: string
  }
}

export type DriverLinkedProfile = {
  id: string
  fullName: string
  licenseNumber: string
}

export type DriverUserOption = {
  id: string
  name: string
  email: string
  status: 'ACTIVE' | 'INACTIVE'
  driverProfile: DriverLinkedProfile | null
}

export type DriverAssignmentSummary = {
  id: string
  startDate: string
  endDate: string | null
  status: 'ACTIVE' | 'ENDED'
  vehicle: {
    id: string
    registrationNumber: string
    make: string
    model: string
    status: string
  }
}

export type DriverRelationCounts = {
  assignments?: number
  faultReports?: number
  fuelLogs?: number
}

export type Driver = {
  id: string
  userId: string | null
  user: LinkedDriverUser | null
  fullName: string
  cnic: string | null
  licenseNumber: string
  licenseExpiry: string
  phone: string | null
  address: string | null
  status: DriverStatus
  assignments?: DriverAssignmentSummary[]
  _count?: DriverRelationCounts
  createdAt: string
  updatedAt: string
}

export type DriverFormValues = {
  userId: string
  fullName: string
  cnic: string
  licenseNumber: string
  licenseExpiry: string
  phone: string
  address: string
  status: DriverStatus
}

export type DriverFilters = {
  search: string
  status: '' | DriverStatus
}

export type DriverListResponse = {
  drivers: Driver[]
}

export type DriverUserListResponse = {
  users: DriverUserOption[]
}

export type DriverResponse = {
  driver: Driver
}

export type DriverMutationResponse = {
  message: string
  driver: Driver
}

export type DriverDeleteResponse = {
  action: 'deleted' | 'deactivated'
  driver: Driver | null
  message: string
}

export const DRIVER_STATUSES: Array<{ label: string; value: DriverStatus }> = [
  { label: 'Active', value: 'ACTIVE' },
  { label: 'Inactive', value: 'INACTIVE' },
]

export const emptyDriverFormValues: DriverFormValues = {
  address: '',
  cnic: '',
  fullName: '',
  licenseExpiry: '',
  licenseNumber: '',
  phone: '',
  status: 'ACTIVE',
  userId: '',
}
