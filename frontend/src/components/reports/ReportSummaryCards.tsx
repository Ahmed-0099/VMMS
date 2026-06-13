import { SummaryCard } from '../SummaryCard'
import type {
  ComplianceReport,
  FuelReport,
  ReportData,
  ReportType,
  VehicleReport,
  WorkOrderReport,
} from '../../types/report'

type ReportSummaryCardsProps = {
  data: ReportData | null
  isLoading: boolean
  reportType: ReportType
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', {
    currency: 'PKR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function formatQuantity(value: number) {
  return `${value.toLocaleString('en-PK', { maximumFractionDigits: 2 })} L`
}

export function ReportSummaryCards({ data, isLoading, reportType }: ReportSummaryCardsProps) {
  if (reportType === 'fuel') {
    const report = data as FuelReport | null

    return (
      <div className="dashboard-grid report-summary-grid">
        <SummaryCard helperText="Fuel quantity in selected filters" isLoading={isLoading} label="Total Quantity" tone="success" value={formatQuantity(report?.summary.totalQuantity ?? 0)} />
        <SummaryCard helperText="Fuel spend in selected filters" isLoading={isLoading} label="Total Fuel Cost" tone="warning" value={formatCurrency(report?.summary.totalCost ?? 0)} />
        <SummaryCard helperText="Average unit cost across entries" isLoading={isLoading} label="Avg Unit Cost" tone="neutral" value={formatCurrency(report?.summary.averageUnitCost ?? 0)} />
        <SummaryCard helperText="Fuel log records included" isLoading={isLoading} label="Fuel Entries" tone="neutral" value={report?.summary.logCount ?? 0} />
      </div>
    )
  }

  if (reportType === 'work-orders') {
    const report = data as WorkOrderReport | null

    return (
      <div className="dashboard-grid report-summary-grid">
        <SummaryCard helperText="Work orders in selected filters" isLoading={isLoading} label="Total Jobs" tone="neutral" value={report?.summary.totalWorkOrders ?? 0} />
        <SummaryCard helperText="Open, in-progress, or waiting parts" isLoading={isLoading} label="Open Work" tone="warning" value={report?.summary.openCount ?? 0} />
        <SummaryCard helperText="Completed or closed jobs" isLoading={isLoading} label="Completed" tone="success" value={report?.summary.completedCount ?? 0} />
        <SummaryCard helperText="Recorded maintenance cost" isLoading={isLoading} label="Work Cost" tone="danger" value={formatCurrency(report?.summary.totalCost ?? 0)} />
      </div>
    )
  }

  if (reportType === 'compliance') {
    const report = data as ComplianceReport | null

    return (
      <div className="dashboard-grid report-summary-grid">
        <SummaryCard helperText="Documents in selected filters" isLoading={isLoading} label="Total Docs" tone="neutral" value={report?.summary.totalDocuments ?? 0} />
        <SummaryCard helperText="Documents currently clear" isLoading={isLoading} label="Valid" tone="success" value={report?.summary.validCount ?? 0} />
        <SummaryCard helperText="Renewal needed soon" isLoading={isLoading} label="Expiring Soon" tone="warning" value={report?.summary.expiringSoonCount ?? 0} />
        <SummaryCard helperText="Already past expiry" isLoading={isLoading} label="Expired" tone="danger" value={report?.summary.expiredCount ?? 0} />
      </div>
    )
  }

  const report = data as VehicleReport | null

  return (
    <div className="dashboard-grid report-summary-grid">
      <SummaryCard helperText="Vehicles in selected filters" isLoading={isLoading} label="Total Vehicles" tone="neutral" value={report?.summary.totalVehicles ?? 0} />
      <SummaryCard helperText="Ready for operations" isLoading={isLoading} label="Active" tone="success" value={report?.summary.active ?? 0} />
      <SummaryCard helperText="Currently under maintenance" isLoading={isLoading} label="In Maintenance" tone="warning" value={report?.summary.inMaintenance ?? 0} />
      <SummaryCard helperText="Unavailable for assignment" isLoading={isLoading} label="Out of Service" tone="danger" value={report?.summary.outOfService ?? 0} />
    </div>
  )
}
