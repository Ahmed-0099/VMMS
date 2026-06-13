import type { DriverStatus } from './driver'
import type { VehicleStatus } from './vehicle'

export type FuelLogVehicleSummary = {
  id: string
  registrationNumber: string
  make: string
  model: string
  fuelType: string
  currentOdometer: number | null
  status: VehicleStatus
}

export type FuelLogDriverSummary = {
  id: string
  fullName: string
  licenseNumber: string
  phone: string | null
  userId: string | null
  status?: DriverStatus
  user: {
    id: string
    name: string
    email: string
  } | null
}

export type FuelLog = {
  id: string
  vehicleId: string
  driverId: string | null
  date: string
  fuelType: string
  quantity: number
  unitCost: number
  totalAmount: number
  odometerReading: number | null
  createdAt: string
  updatedAt: string
  vehicle: FuelLogVehicleSummary
  driver: FuelLogDriverSummary | null
}

export type FuelLogFormValues = {
  vehicleId: string
  driverId: string
  date: string
  fuelType: string
  quantity: string
  unitCost: string
  odometerReading: string
}

export type FuelLogFilters = {
  vehicleId: string
  driverId: string
  from: string
  to: string
}

export type FuelLogSummary = {
  totalQuantity: number
  totalCost: number
  averageUnitCost: number
}

export type FuelLogListResponse = {
  fuelLogs: FuelLog[]
}

export type FuelLogMutationResponse = {
  message: string
  fuelLog: FuelLog
}

export type FuelLogDeleteResponse = {
  message: string
}

export const FUEL_TYPES = ['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid'] as const

export const defaultFuelLogFilters: FuelLogFilters = {
  driverId: '',
  from: '',
  to: '',
  vehicleId: '',
}

export const emptyFuelLogFormValues: FuelLogFormValues = {
  date: new Date().toISOString().slice(0, 10),
  driverId: '',
  fuelType: 'Diesel',
  odometerReading: '',
  quantity: '',
  unitCost: '',
  vehicleId: '',
}
