import { useCallback, useEffect, useState } from 'react'
import { ReportChart } from '../components/reports/ReportChart'
import { ReportFilters } from '../components/reports/ReportFilters'
import { ReportSummaryCards } from '../components/reports/ReportSummaryCards'
import { ReportTable } from '../components/reports/ReportTable'
import { useReports } from '../hooks/useReports'
import { getVehicles } from '../services/vehicleService'
import {
  defaultReportFilters,
  type ReportFilters as ReportFiltersType,
  type ReportType,
} from '../types/report'
import type { Vehicle } from '../types/vehicle'
import { exportProfessionalReportPdf, type ExportChartImage } from '../utils/exportReport'
import { getApiErrorMessage } from '../utils/getApiErrorMessage'

const reportTabs: Array<{ description: string; label: string; type: ReportType }> = [
  { description: 'Fleet availability by vehicle status.', label: 'Vehicles', type: 'vehicles' },
  { description: 'Fuel quantity, spend, and unit cost.', label: 'Fuel', type: 'fuel' },
  { description: 'Maintenance jobs by status and cost.', label: 'Work Orders', type: 'work-orders' },
  { description: 'Vehicle document health by expiry status.', label: 'Compliance', type: 'compliance' },
]

function getReportTitle(reportType: ReportType) {
  return reportTabs.find((tab) => tab.type === reportType)?.label ?? 'Reports'
}

export function Reports() {
  const [activeReportType, setActiveReportType] = useState<ReportType>('vehicles')
  const [filters, setFilters] = useState<ReportFiltersType>(defaultReportFilters)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [isOptionsLoading, setIsOptionsLoading] = useState(true)
  const [optionsError, setOptionsError] = useState('')
  const { data, error, isLoading, reload } = useReports(activeReportType, filters)

  const loadOptions = useCallback(async () => {
    await Promise.resolve()
    setIsOptionsLoading(true)
    setOptionsError('')

    try {
      const vehicleList = await getVehicles({ category: '', fuelType: '', search: '', status: '' })
      setVehicles(vehicleList)
    } catch (apiError) {
      setOptionsError(getApiErrorMessage(apiError, 'Unable to load vehicle filters for reports.'))
    } finally {
      setIsOptionsLoading(false)
    }
  }, [])

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

  function handleTabChange(reportType: ReportType) {
    setActiveReportType(reportType)
    setFilters(defaultReportFilters)
  }

  function clearFilters() {
    setFilters(defaultReportFilters)
  }

  function getSelectedVehicleLabel() {
    if (!filters.vehicleId) {
      return 'All vehicles'
    }

    const vehicle = vehicles.find((vehicleItem) => vehicleItem.id === filters.vehicleId)
    return vehicle ? `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.model}` : 'Selected vehicle'
  }

  function getChartImage(): ExportChartImage | null {
    const canvas = document.querySelector<HTMLCanvasElement>('.report-chart-body canvas')

    if (!canvas) {
      return null
    }

    const exportCanvas = document.createElement('canvas')
    exportCanvas.width = canvas.width
    exportCanvas.height = canvas.height

    const context = exportCanvas.getContext('2d')

    if (!context) {
      return null
    }

    context.fillStyle = '#ffffff'
    context.fillRect(0, 0, exportCanvas.width, exportCanvas.height)
    context.drawImage(canvas, 0, 0)

    return {
      dataUrl: exportCanvas.toDataURL('image/jpeg', 0.92),
      height: exportCanvas.height,
      width: exportCanvas.width,
    }
  }

  function handleExportReport() {
    if (!data) {
      return
    }

    exportProfessionalReportPdf({
      chartImage: getChartImage(),
      data,
      filters,
      reportTitle: getReportTitle(activeReportType),
      reportType: activeReportType,
      vehicleLabel: getSelectedVehicleLabel(),
    })
  }

  return (
    <>
      <div className="module-header">
        <div>
          <span className="section-kicker">Reports</span>
          <h2 className="dashboard-title">Fleet reporting center</h2>
          <p className="dashboard-subtitle">
            Review current-scope vehicle, fuel, work order, and compliance summaries with focused filters.
          </p>
        </div>
        <div className="module-actions">
          <button className="btn btn-outline-secondary" type="button" onClick={reload} disabled={isLoading}>
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="btn btn-success" type="button" onClick={handleExportReport} disabled={!data || isLoading}>
            Export Report
          </button>
        </div>
      </div>

      {(error || optionsError) && (
        <div className="alert alert-danger module-alert" role="alert">
          {optionsError || error}
        </div>
      )}

      <section className="module-panel report-tab-panel">
        <div className="report-tabs" role="tablist" aria-label="Report type">
          {reportTabs.map((tab) => (
            <button
              key={tab.type}
              className={`report-tab${activeReportType === tab.type ? ' active' : ''}`}
              type="button"
              onClick={() => handleTabChange(tab.type)}
            >
              <span>{tab.label}</span>
              <small>{tab.description}</small>
            </button>
          ))}
        </div>

        <ReportFilters
          filters={filters}
          isLoadingOptions={isOptionsLoading}
          reportType={activeReportType}
          vehicles={vehicles}
          onChange={setFilters}
          onClear={clearFilters}
        />
      </section>

      <ReportSummaryCards data={data} isLoading={isLoading} reportType={activeReportType} />

      <section className="report-content-grid">
        <div className="module-panel report-chart-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">{getReportTitle(activeReportType)}</span>
              <h3>Visual summary</h3>
            </div>
          </div>
          <div className="report-chart-body">
            <ReportChart data={data} isLoading={isLoading} reportType={activeReportType} />
          </div>
        </div>

        <div className="module-panel report-table-panel">
          <div className="module-panel-header">
            <div>
              <span className="section-kicker">{getReportTitle(activeReportType)}</span>
              <h3>Report rows</h3>
            </div>
          </div>
          <ReportTable data={data} isLoading={isLoading} reportType={activeReportType} />
        </div>
      </section>
    </>
  )
}
