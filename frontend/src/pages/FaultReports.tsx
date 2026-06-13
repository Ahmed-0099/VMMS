import { useCallback, useEffect, useState } from 'react'
import { ConvertToWorkOrderModal } from '../components/faultReports/ConvertToWorkOrderModal'
import { FaultReportForm } from '../components/faultReports/FaultReportForm'
import { FaultReportTable } from '../components/faultReports/FaultReportTable'
import { SummaryCard } from '../components/SummaryCard'
import { useAuth } from '../context/AuthContext'
import { useFaultReports } from '../hooks/useFaultReports'
import { getMyActiveAssignment } from '../services/assignmentService'
import { getDrivers } from '../services/driverService'
import {
  convertFaultReportToWorkOrder,
  createFaultReport,
  updateFaultReportStatus,
} from '../services/faultReportService'
import { getVehicles } from '../services/vehicleService'
import { getWorkOrderTechnicians } from '../services/workOrderService'
import type { VehicleAssignment } from '../types/assignment'
import type { Driver } from '../types/driver'
import {
  defaultFaultReportFilters,
  emptyFaultReportConvertValues,
  emptyFaultReportFormValues,
  FAULT_REPORT_STATUSES,
  FAULT_URGENCIES,
  type FaultReport,
  type FaultReportConvertValues,
  type FaultReportFormValues,
  type FaultReportStatus,
} from '../types/faultReport'
import type { Vehicle } from '../types/vehicle'
import type { WorkOrderTechnician } from '../types/workOrder'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

function getDriverFormDefaults(assignment: VehicleAssignment | null): FaultReportFormValues {
  if (!assignment) {
    return emptyFaultReportFormValues
  }

  return {
    ...emptyFaultReportFormValues,
    vehicleId: assignment.vehicleId,
  }
}

function getDefaultPriority(report: FaultReport) {
  if (report.urgency === 'HIGH') {
    return 'HIGH'
  }

  if (report.urgency === 'LOW') {
    return 'LOW'
  }

  return 'MEDIUM'
}

function getConvertDefaults(report: FaultReport): FaultReportConvertValues {
  return {
    ...emptyFaultReportConvertValues,
    description: report.description,
    priority: getDefaultPriority(report),
    serviceType: report.urgency === 'HIGH' ? 'Urgent fault repair' : 'Fault inspection',
  }
}

export function FaultReports() {
  const { user } = useAuth()
  const { error, faultReports, filters, isLoading, reload, setFilters, summary } = useFaultReports()
  const [formValues, setFormValues] = useState<FaultReportFormValues>(emptyFaultReportFormValues)
  const [activeAssignment, setActiveAssignment] = useState<VehicleAssignment | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [technicians, setTechnicians] = useState<WorkOrderTechnician[]>([])
  const [convertReport, setConvertReport] = useState<FaultReport | null>(null)
  const [convertValues, setConvertValues] = useState<FaultReportConvertValues>(emptyFaultReportConvertValues)
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const [formError, setFormError] = useState('')
  const [optionsError, setOptionsError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')

  const isAdmin = user?.role === 'ADMIN'
  const isDriver = user?.role === 'DRIVER'

  const loadOptions = useCallback(async () => {
    await Promise.resolve()
    setIsOptionsLoading(true)
    setOptionsError('')

    try {
      if (isAdmin) {
        const [vehicleList, driverList, technicianList] = await Promise.all([
          getVehicles({ category: '', fuelType: '', search: '', status: '' }),
          getDrivers({ search: '', status: '' }),
          getWorkOrderTechnicians(),
        ])

        setVehicles(vehicleList)
        setDrivers(driverList)
        setTechnicians(technicianList)
        return
      }

      if (isDriver) {
        const response = await getMyActiveAssignment()
        setActiveAssignment(response.assignment)
        setFormValues((currentValues) => {
          if (currentValues.vehicleId) {
            return currentValues
          }

          return getDriverFormDefaults(response.assignment)
        })
      }
    } catch (apiError) {
      setOptionsError(getApiErrorMessage(apiError, 'Unable to load fault report options.'))
    } finally {
      setIsOptionsLoading(false)
    }
  }, [isAdmin, isDriver])

  useEffect(() => {
    let isMounted = true

    async function loadInitialOptions() {
      await Promise.resolve()

      if (!isMounted) {
        return
      }

      await loadOptions()
    }

    loadInitialOptions()

    return () => {
      isMounted = false
    }
  }, [loadOptions])

  function clearFilters() {
    setFilters(defaultFaultReportFilters)
  }

  function openConvertPanel(report: FaultReport) {
    setConvertReport(report)
    setConvertValues(getConvertDefaults(report))
    setFormError('')
    setSuccessMessage('')
  }

  function closeConvertPanel() {
    setConvertReport(null)
    setConvertValues(emptyFaultReportConvertValues)
  }

  async function handleSubmit() {
    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      await createFaultReport(formValues)
      setSuccessMessage('Fault report submitted successfully.')
      setFormValues(getDriverFormDefaults(activeAssignment))
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to submit fault report. Please review the form and try again.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleStatusChange(report: FaultReport, status: FaultReportStatus) {
    setIsUpdatingStatus(true)
    setFormError('')
    setSuccessMessage('')

    try {
      await updateFaultReportStatus(report.id, status)
      setSuccessMessage(status === 'REVIEWED' ? 'Fault report marked as reviewed.' : 'Fault report closed successfully.')
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to update fault report status.'))
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  async function handleConvert() {
    if (!convertReport) {
      return
    }

    setIsSubmitting(true)
    setFormError('')
    setSuccessMessage('')

    try {
      await convertFaultReportToWorkOrder(convertReport.id, convertValues)
      setSuccessMessage('Fault report converted into a work order.')
      closeConvertPanel()
      await reload()
    } catch (apiError) {
      setFormError(getApiErrorMessage(apiError, 'Unable to convert fault report to a work order.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Fault reports</span>
          <h2 className="dashboard-title">{isAdmin ? 'Fault report queue' : 'Report vehicle issues'}</h2>
          <p className="dashboard-subtitle">
            {isAdmin
              ? 'Review driver-reported issues, close resolved reports, or convert serious faults into work orders.'
              : 'Submit vehicle issues for fleet review and track what happened after your report.'}
          </p>
        </div>
      </div>

      {(error || formError || optionsError || successMessage) && (
        <div className={`alert ${successMessage ? 'alert-success' : 'alert-danger'} module-alert`} role="alert">
          {successMessage || formError || optionsError || error}
        </div>
      )}

      <div className="dashboard-grid fault-summary-grid">
        <SummaryCard helperText="Reports waiting for Admin review" isLoading={isLoading} label="New Reports" tone="danger" value={summary.newReports} />
        <SummaryCard helperText="Open high urgency issues" isLoading={isLoading} label="High Urgency" tone="warning" value={summary.highUrgency} />
        <SummaryCard helperText="Reports converted into jobs" isLoading={isLoading} label="Converted" tone="success" value={summary.converted} />
        <SummaryCard helperText="Reports after filters" isLoading={isLoading} label="Total Reports" tone="neutral" value={summary.total} />
      </div>

      {isDriver ? (
        <section className="module-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">Driver report</span>
              <h3>Submit a vehicle fault</h3>
            </div>
          </div>
          {activeAssignment ? (
            <FaultReportForm
              assignedVehicle={activeAssignment.vehicle}
              isSubmitting={isSubmitting}
              values={formValues}
              onChange={setFormValues}
              onSubmit={handleSubmit}
            />
          ) : isOptionsLoading ? (
            <div className="vehicle-table-state" role="status">
              Loading your assigned vehicle...
            </div>
          ) : (
            <div className="vehicle-table-state">
              <h3>No active vehicle assigned</h3>
              <p>Your fleet manager needs to assign a vehicle before you can submit fault reports.</p>
            </div>
          )}
        </section>
      ) : null}

      {isAdmin && convertReport ? (
        <ConvertToWorkOrderModal
          faultReport={convertReport}
          isLoadingOptions={isOptionsLoading}
          isSubmitting={isSubmitting}
          technicians={technicians}
          values={convertValues}
          onCancel={closeConvertPanel}
          onChange={setConvertValues}
          onSubmit={handleConvert}
        />
      ) : null}

      <section className="module-panel">
        <div className="fault-report-toolbar">
          {isAdmin ? (
            <>
              <div>
                <label className="form-label" htmlFor="faultReportVehicleFilter">
                  Vehicle
                </label>
                <select
                  className="form-select"
                  id="faultReportVehicleFilter"
                  value={filters.vehicleId}
                  onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, vehicleId: event.target.value }))}
                >
                  <option value="">All vehicles</option>
                  {vehicles.map((vehicle) => (
                    <option key={vehicle.id} value={vehicle.id}>
                      {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label" htmlFor="faultReportDriverFilter">
                  Driver
                </label>
                <select
                  className="form-select"
                  id="faultReportDriverFilter"
                  value={filters.driverId}
                  onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, driverId: event.target.value }))}
                >
                  <option value="">All drivers</option>
                  {drivers.map((driver) => (
                    <option key={driver.id} value={driver.id}>
                      {driver.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </>
          ) : null}

          <div>
            <label className="form-label" htmlFor="faultReportStatusFilter">
              Status
            </label>
            <select
              className="form-select"
              id="faultReportStatusFilter"
              value={filters.status}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, status: event.target.value as typeof filters.status }))}
            >
              <option value="">All statuses</option>
              {FAULT_REPORT_STATUSES.map((status) => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label" htmlFor="faultReportUrgencyFilter">
              Urgency
            </label>
            <select
              className="form-select"
              id="faultReportUrgencyFilter"
              value={filters.urgency}
              onChange={(event) => setFilters((currentFilters) => ({ ...currentFilters, urgency: event.target.value as typeof filters.urgency }))}
            >
              <option value="">All urgency levels</option>
              {FAULT_URGENCIES.map((urgency) => (
                <option key={urgency.value} value={urgency.value}>
                  {urgency.label}
                </option>
              ))}
            </select>
          </div>

          <div className="fault-report-toolbar-action">
            <button className="btn btn-outline-secondary" type="button" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>

        <FaultReportTable
          currentRole={user?.role ?? 'DRIVER'}
          faultReports={faultReports}
          isLoading={isLoading}
          isUpdatingStatus={isUpdatingStatus}
          onClose={(report) => handleStatusChange(report, 'CLOSED')}
          onConvert={openConvertPanel}
          onReview={(report) => handleStatusChange(report, 'REVIEWED')}
        />
      </section>
    </>
  )
}
