import type {
  ComplianceReport,
  FuelReport,
  ReportData,
  ReportType,
  VehicleReport,
  WorkOrderReport,
} from '../../types/report'

type ReportTableProps = {
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

function formatStatus(value: string) {
  return value.replaceAll('_', ' ')
}

export function ReportTable({ data, isLoading, reportType }: ReportTableProps) {
  if (isLoading) {
    return (
      <div className="vehicle-table-state" role="status">
        Loading report rows...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="vehicle-table-state">
        <h3>No report data</h3>
        <p>Choose a report type or adjust filters to review fleet data.</p>
      </div>
    )
  }

  if (reportType === 'fuel') {
    const report = data as FuelReport

    if (report.rows.length === 0) {
      return (
        <div className="vehicle-table-state">
          <h3>No fuel rows found</h3>
          <p>Fuel totals by vehicle will appear after matching entries exist.</p>
        </div>
      )
    }

    return (
      <div className="vehicle-table-wrap report-table-wrap">
        <table className="table report-table align-middle mb-0">
          <thead>
            <tr>
              <th>Vehicle</th>
              <th>Entries</th>
              <th>Total Quantity</th>
              <th>Total Cost</th>
              <th>Average Unit Cost</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.vehicleId}>
                <td className="vehicle-main-text">{row.vehicle}</td>
                <td>{row.logCount}</td>
                <td>{formatQuantity(row.totalQuantity)}</td>
                <td>{formatCurrency(row.totalCost)}</td>
                <td>{formatCurrency(row.averageUnitCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (reportType === 'work-orders') {
    const report = data as WorkOrderReport

    return (
      <div className="vehicle-table-wrap report-table-wrap">
        <table className="table report-table align-middle mb-0">
          <thead>
            <tr>
              <th>Status</th>
              <th>Work Orders</th>
              <th>Total Cost</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.status}>
                <td className="vehicle-main-text">{row.label}</td>
                <td>{row.count}</td>
                <td>{formatCurrency(row.totalCost ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  if (reportType === 'compliance') {
    const report = data as ComplianceReport

    return (
      <div className="vehicle-table-wrap report-table-wrap">
        <table className="table report-table align-middle mb-0">
          <thead>
            <tr>
              <th>Status</th>
              <th>Documents</th>
            </tr>
          </thead>
          <tbody>
            {report.rows.map((row) => (
              <tr key={row.status}>
                <td className="vehicle-main-text">{row.label}</td>
                <td>{row.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  const report = data as VehicleReport

  return (
    <div className="vehicle-table-wrap report-table-wrap">
      <table className="table report-table align-middle mb-0">
        <thead>
          <tr>
            <th>Status</th>
            <th>Vehicles</th>
          </tr>
        </thead>
        <tbody>
          {report.rows.map((row) => (
            <tr key={row.status}>
              <td className="vehicle-main-text">{formatStatus(row.label)}</td>
              <td>{row.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
