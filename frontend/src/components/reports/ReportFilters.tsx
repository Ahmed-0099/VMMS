import { COMPLIANCE_DOCUMENT_STATUSES } from '../../types/complianceDocument'
import type { ReportFilters as ReportFiltersType, ReportType } from '../../types/report'
import type { Vehicle } from '../../types/vehicle'
import { VEHICLE_STATUSES } from '../../types/vehicle'
import { WORK_ORDER_STATUSES } from '../../types/workOrder'

type ReportFiltersProps = {
  filters: ReportFiltersType
  isLoadingOptions: boolean
  onChange: (filters: ReportFiltersType) => void
  onClear: () => void
  reportType: ReportType
  vehicles: Vehicle[]
}

function getStatusOptions(reportType: ReportType) {
  if (reportType === 'work-orders') {
    return WORK_ORDER_STATUSES
  }

  if (reportType === 'compliance') {
    return COMPLIANCE_DOCUMENT_STATUSES
  }

  return VEHICLE_STATUSES
}

function getDateLabel(reportType: ReportType) {
  if (reportType === 'fuel') {
    return 'Fuel date'
  }

  if (reportType === 'compliance') {
    return 'Expiry date'
  }

  return 'Created date'
}

function getStatusLabel(reportType: ReportType) {
  if (reportType === 'work-orders') {
    return 'Work order status'
  }

  if (reportType === 'compliance') {
    return 'Document status'
  }

  return 'Vehicle status'
}

export function ReportFilters({ filters, isLoadingOptions, onChange, onClear, reportType, vehicles }: ReportFiltersProps) {
  function updateField(field: keyof ReportFiltersType, value: string) {
    onChange({ ...filters, [field]: value })
  }

  const statusOptions = getStatusOptions(reportType)
  const dateLabel = getDateLabel(reportType)

  return (
    <div className="report-toolbar">
      <div>
        <label className="form-label" htmlFor="reportVehicleFilter">
          Vehicle
        </label>
        <select
          className="form-select"
          id="reportVehicleFilter"
          value={filters.vehicleId}
          onChange={(event) => updateField('vehicleId', event.target.value)}
          disabled={isLoadingOptions}
        >
          <option value="">{isLoadingOptions ? 'Loading vehicles...' : 'All vehicles'}</option>
          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="reportStatusFilter">
          {getStatusLabel(reportType)}
        </label>
        <select
          className="form-select"
          id="reportStatusFilter"
          value={filters.status}
          onChange={(event) => updateField('status', event.target.value)}
        >
          <option value="">All statuses</option>
          {statusOptions.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="form-label" htmlFor="reportFromFilter">
          {dateLabel} from
        </label>
        <input
          className="form-control"
          id="reportFromFilter"
          type="date"
          value={filters.from}
          onChange={(event) => updateField('from', event.target.value)}
        />
      </div>

      <div>
        <label className="form-label" htmlFor="reportToFilter">
          {dateLabel} to
        </label>
        <input
          className="form-control"
          id="reportToFilter"
          type="date"
          value={filters.to}
          onChange={(event) => updateField('to', event.target.value)}
        />
      </div>

      <div className="report-toolbar-action">
        <button className="btn btn-outline-secondary" type="button" onClick={onClear}>
          Clear Filters
        </button>
      </div>
    </div>
  )
}
