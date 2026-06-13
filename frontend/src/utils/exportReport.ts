import type {
  ComplianceReport,
  FuelReport,
  ReportData,
  ReportFilters,
  ReportType,
  VehicleReport,
  WorkOrderReport,
} from '../types/report'

type ReportSection = {
  headers: string[]
  rows: Array<Array<number | string>>
  title: string
}

function escapeHtml(value: number | string) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-PK', {
    currency: 'PKR',
    maximumFractionDigits: 0,
    style: 'currency',
  }).format(value)
}

function formatNumber(value: number) {
  return value.toLocaleString('en-PK', { maximumFractionDigits: 2 })
}

function formatQuantity(value: number) {
  return `${formatNumber(value)} L`
}

function formatStatus(value: string) {
  return value.replaceAll('_', ' ')
}

function getFilterSummary(filters: ReportFilters, vehicleLabel: string) {
  return [
    ['Vehicle', vehicleLabel || 'All vehicles'],
    ['Status', filters.status ? formatStatus(filters.status) : 'All statuses'],
    ['From', filters.from || 'Not set'],
    ['To', filters.to || 'Not set'],
  ]
}

function getSummaryCards(reportType: ReportType, data: ReportData) {
  if (reportType === 'fuel') {
    const report = data as FuelReport

    return [
      ['Total Quantity', formatQuantity(report.summary.totalQuantity)],
      ['Total Fuel Cost', formatCurrency(report.summary.totalCost)],
      ['Average Unit Cost', formatCurrency(report.summary.averageUnitCost)],
      ['Fuel Entries', formatNumber(report.summary.logCount)],
    ]
  }

  if (reportType === 'work-orders') {
    const report = data as WorkOrderReport

    return [
      ['Total Jobs', formatNumber(report.summary.totalWorkOrders)],
      ['Open Work', formatNumber(report.summary.openCount)],
      ['Completed', formatNumber(report.summary.completedCount)],
      ['Work Cost', formatCurrency(report.summary.totalCost)],
    ]
  }

  if (reportType === 'compliance') {
    const report = data as ComplianceReport

    return [
      ['Total Documents', formatNumber(report.summary.totalDocuments)],
      ['Valid', formatNumber(report.summary.validCount)],
      ['Expiring Soon', formatNumber(report.summary.expiringSoonCount)],
      ['Expired', formatNumber(report.summary.expiredCount)],
    ]
  }

  const report = data as VehicleReport

  return [
    ['Total Vehicles', formatNumber(report.summary.totalVehicles)],
    ['Active', formatNumber(report.summary.active)],
    ['In Maintenance', formatNumber(report.summary.inMaintenance)],
    ['Out of Service', formatNumber(report.summary.outOfService)],
  ]
}

function getReportSections(reportType: ReportType, data: ReportData): ReportSection[] {
  if (reportType === 'fuel') {
    const report = data as FuelReport

    return [
      {
        headers: ['Vehicle', 'Entries', 'Total Quantity', 'Total Cost', 'Average Unit Cost'],
        rows: report.rows.map((row) => [
          row.vehicle,
          row.logCount,
          formatQuantity(row.totalQuantity),
          formatCurrency(row.totalCost),
          formatCurrency(row.averageUnitCost),
        ]),
        title: 'Fuel Cost by Vehicle',
      },
      {
        headers: ['Date', 'Entries', 'Total Quantity', 'Total Cost'],
        rows: report.dateRows.map((row) => [
          row.date,
          row.logCount,
          formatQuantity(row.totalQuantity),
          formatCurrency(row.totalCost),
        ]),
        title: 'Fuel Activity by Date',
      },
    ]
  }

  if (reportType === 'work-orders') {
    const report = data as WorkOrderReport

    return [
      {
        headers: ['Status', 'Work Orders', 'Total Cost'],
        rows: report.rows.map((row) => [row.label, row.count, formatCurrency(row.totalCost ?? 0)]),
        title: 'Work Orders by Status',
      },
      {
        headers: ['Vehicle', 'Work Orders', 'Total Cost'],
        rows: report.vehicleRows.map((row) => [row.vehicle, row.count, formatCurrency(row.totalCost)]),
        title: 'Work Orders by Vehicle',
      },
    ]
  }

  if (reportType === 'compliance') {
    const report = data as ComplianceReport

    return [
      {
        headers: ['Status', 'Documents'],
        rows: report.rows.map((row) => [row.label, row.count]),
        title: 'Compliance by Status',
      },
      {
        headers: ['Vehicle', 'Documents', 'Valid', 'Expiring Soon', 'Expired'],
        rows: report.vehicleRows.map((row) => [row.vehicle, row.count, row.valid, row.expiringSoon, row.expired]),
        title: 'Compliance by Vehicle',
      },
    ]
  }

  const report = data as VehicleReport

  return [
    {
      headers: ['Status', 'Vehicles'],
      rows: report.rows.map((row) => [row.label, row.count]),
      title: 'Vehicles by Status',
    },
    {
      headers: ['Registration', 'Vehicle', 'Status'],
      rows: report.vehicles.map((vehicle) => [vehicle.registrationNumber, vehicle.label, formatStatus(vehicle.status)]),
      title: 'Vehicle Detail',
    },
  ]
}

function renderCards(cards: string[][]) {
  return cards
    .map(
      ([label, value]) => `
        <div class="metric-card">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `,
    )
    .join('')
}

function renderTable(section: ReportSection) {
  const rows =
    section.rows.length > 0
      ? section.rows
          .map(
            (row) => `
              <tr>
                ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
              </tr>
            `,
          )
          .join('')
      : `<tr><td colspan="${section.headers.length}">No data found for this section.</td></tr>`

  return `
    <section class="table-section">
      <h2>${escapeHtml(section.title)}</h2>
      <table>
        <thead>
          <tr>${section.headers.map((header) => `<th>${escapeHtml(header)}</th>`).join('')}</tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </section>
  `
}

function getReportHtml({
  chartImage,
  data,
  filters,
  reportTitle,
  vehicleLabel,
}: {
  chartImage: string | null
  data: ReportData
  filters: ReportFilters
  reportTitle: string
  vehicleLabel: string
}) {
  const generatedAt = new Intl.DateTimeFormat('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date())
  const filterSummary = getFilterSummary(filters, vehicleLabel)
  const sections = getReportSections(reportTitleToType(reportTitle), data)

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <title>VMMS ${escapeHtml(reportTitle)} Report</title>
        <style>
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #123047;
            background: #f5f7fb;
            font-family: Inter, "Segoe UI", Arial, sans-serif;
          }
          .report-shell {
            width: min(1120px, calc(100% - 48px));
            margin: 24px auto;
            padding: 28px;
            border: 1px solid #dfe7ef;
            border-radius: 12px;
            background: #ffffff;
          }
          .report-header {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 24px;
            padding-bottom: 20px;
            border-bottom: 1px solid #dfe7ef;
          }
          .kicker {
            color: #20735c;
            font-size: 12px;
            font-weight: 800;
            letter-spacing: 0;
            text-transform: uppercase;
          }
          h1 {
            margin: 6px 0 0;
            color: #123047;
            font-size: 34px;
            line-height: 1.1;
          }
          .generated {
            color: #657789;
            font-size: 13px;
            font-weight: 700;
            text-align: right;
          }
          .filter-grid,
          .metric-grid {
            display: grid;
            grid-template-columns: repeat(4, minmax(0, 1fr));
            gap: 12px;
            margin-top: 18px;
          }
          .filter-card,
          .metric-card {
            padding: 14px;
            border: 1px solid #e7edf3;
            border-radius: 10px;
            background: #fbfcfe;
          }
          .filter-card span,
          .metric-card span {
            display: block;
            color: #718096;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
          }
          .filter-card strong,
          .metric-card strong {
            display: block;
            margin-top: 6px;
            color: #123047;
            font-size: 18px;
          }
          .chart-card,
          .table-section {
            margin-top: 22px;
            padding: 18px;
            border: 1px solid #dfe7ef;
            border-radius: 12px;
            background: #ffffff;
          }
          .chart-card h2,
          .table-section h2 {
            margin: 0 0 14px;
            color: #123047;
            font-size: 18px;
          }
          .chart-card img {
            display: block;
            width: 100%;
            max-height: 360px;
            object-fit: contain;
          }
          .chart-empty {
            display: grid;
            min-height: 160px;
            place-items: center;
            color: #718096;
            border: 1px dashed #cbd5df;
            border-radius: 10px;
            font-weight: 700;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th {
            color: #607083;
            font-size: 12px;
            text-align: left;
            text-transform: uppercase;
          }
          th,
          td {
            padding: 11px 10px;
            border-bottom: 1px solid #eef2f6;
          }
          td {
            color: #344054;
            font-size: 13px;
            font-weight: 650;
          }
          .actions {
            display: flex;
            justify-content: flex-end;
            margin: 18px 0;
          }
          .print-button {
            border: 0;
            border-radius: 8px;
            padding: 10px 16px;
            color: #ffffff;
            background: #0f5132;
            font-weight: 800;
            cursor: pointer;
          }
          @media print {
            body { background: #ffffff; }
            .report-shell {
              width: 100%;
              margin: 0;
              border: 0;
              border-radius: 0;
            }
            .actions { display: none; }
            .table-section,
            .chart-card {
              break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <main class="report-shell">
          <div class="actions">
            <button class="print-button" onclick="window.print()">Print or Save as PDF</button>
          </div>
          <header class="report-header">
            <div>
              <span class="kicker">VMMS Fleet Report</span>
              <h1>${escapeHtml(reportTitle)} Report</h1>
            </div>
            <div class="generated">
              Generated<br />${escapeHtml(generatedAt)}
            </div>
          </header>

          <section class="filter-grid">
            ${filterSummary
              .map(
                ([label, value]) => `
                  <div class="filter-card">
                    <span>${escapeHtml(label)}</span>
                    <strong>${escapeHtml(value)}</strong>
                  </div>
                `,
              )
              .join('')}
          </section>

          <section class="metric-grid">
            ${renderCards(getSummaryCards(reportTitleToType(reportTitle), data))}
          </section>

          <section class="chart-card">
            <h2>Visual Summary</h2>
            ${
              chartImage
                ? `<img src="${chartImage}" alt="${escapeHtml(reportTitle)} chart" />`
                : '<div class="chart-empty">No chart available for this export.</div>'
            }
          </section>

          ${sections.map(renderTable).join('')}
        </main>
      </body>
    </html>
  `
}

function reportTitleToType(reportTitle: string): ReportType {
  if (reportTitle === 'Fuel') {
    return 'fuel'
  }

  if (reportTitle === 'Work Orders') {
    return 'work-orders'
  }

  if (reportTitle === 'Compliance') {
    return 'compliance'
  }

  return 'vehicles'
}

export function exportProfessionalReport({
  chartImage,
  data,
  filters,
  reportTitle,
  vehicleLabel,
}: {
  chartImage: string | null
  data: ReportData
  filters: ReportFilters
  reportTitle: string
  vehicleLabel: string
}) {
  const reportHtml = getReportHtml({
    chartImage,
    data,
    filters,
    reportTitle,
    vehicleLabel,
  })
  const reportWindow = window.open('', '_blank', 'width=1200,height=900')

  if (reportWindow) {
    reportWindow.document.open()
    reportWindow.document.write(reportHtml)
    reportWindow.document.close()
    reportWindow.focus()
    return
  }

  const blob = new Blob([reportHtml], { type: 'text/html;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `vmms-${reportTitle.toLowerCase().replaceAll(' ', '-')}-report.html`
  link.click()
  URL.revokeObjectURL(url)
}
