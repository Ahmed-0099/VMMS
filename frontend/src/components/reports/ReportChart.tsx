import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from 'chart.js'
import { Bar, Doughnut } from 'react-chartjs-2'
import type {
  ComplianceReport,
  FuelReport,
  ReportData,
  ReportType,
  VehicleReport,
  WorkOrderReport,
} from '../../types/report'

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, Legend, Tooltip)

type ReportChartProps = {
  data: ReportData | null
  isLoading: boolean
  reportType: ReportType
}

const chartColors = ['#0f5132', '#c97900', '#b42318', '#3f6484', '#718096']

function hasValues(values: number[]) {
  return values.some((value) => value > 0)
}

export function ReportChart({ data, isLoading, reportType }: ReportChartProps) {
  if (isLoading) {
    return (
      <div className="report-chart-empty" role="status">
        Loading chart...
      </div>
    )
  }

  if (!data) {
    return (
      <div className="report-chart-empty">
        <h3>No report data</h3>
        <p>Apply filters or add module records to build this report.</p>
      </div>
    )
  }

  if (reportType === 'fuel') {
    const report = data as FuelReport
    const labels = report.rows.map((row) => row.vehicle)
    const values = report.rows.map((row) => row.totalCost)

    if (!hasValues(values)) {
      return (
        <div className="report-chart-empty">
          <h3>No fuel costs found</h3>
          <p>Fuel entries matching these filters will appear here.</p>
        </div>
      )
    }

    return (
      <Bar
        data={{
          datasets: [{ backgroundColor: '#0f5132', data: values, label: 'Fuel cost' }],
          labels,
        }}
        options={{
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } },
        }}
      />
    )
  }

  if (reportType === 'work-orders') {
    const report = data as WorkOrderReport
    const labels = report.rows.map((row) => row.label)
    const values = report.rows.map((row) => row.count)

    return (
      <Doughnut
        data={{
          datasets: [{ backgroundColor: chartColors, data: values }],
          labels,
        }}
        options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
      />
    )
  }

  if (reportType === 'compliance') {
    const report = data as ComplianceReport
    const labels = report.rows.map((row) => row.label)
    const values = report.rows.map((row) => row.count)

    return (
      <Doughnut
        data={{
          datasets: [{ backgroundColor: ['#0f5132', '#c97900', '#b42318'], data: values }],
          labels,
        }}
        options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }}
      />
    )
  }

  const report = data as VehicleReport
  const labels = report.rows.map((row) => row.label)
  const values = report.rows.map((row) => row.count)

  return (
    <Bar
      data={{
        datasets: [{ backgroundColor: ['#0f5132', '#c97900', '#b42318'], data: values, label: 'Vehicles' }],
        labels,
      }}
      options={{
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
      }}
    />
  )
}
