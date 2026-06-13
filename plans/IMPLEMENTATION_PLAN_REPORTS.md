# Implementation Plan: Reports

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: simple current-scope reports for vehicles, fuel, work orders, and compliance. Do not build advanced executive analytics, PDF export, Excel export, accounting integration, or AI predictions.

## 1. DB RELATED CHANGES

- No new tables are required for current-scope reports.
- Reports should query existing tables:
  - `vehicles`
  - `drivers`
  - `work_orders`
  - `fuel_logs`
  - `compliance_documents`
  - `maintenance_schedules`
  - `fault_reports`
- Confirm helpful indexes exist:
  - `FuelLog.date`
  - `FuelLog.vehicleId`
  - `WorkOrder.status`
  - `WorkOrder.vehicleId`
  - `ComplianceDocument.status`
  - `ComplianceDocument.expiryDate`
  - `Vehicle.status`
- Do not create denormalized reporting tables unless performance becomes a real issue.

## 2. BACKEND RELATED CHANGES

- Create `backend/src/controllers/reportController.js`.
  - `getVehicleReport(req, res, next)`
  - `getFuelReport(req, res, next)`
  - `getWorkOrderReport(req, res, next)`
  - `getComplianceReport(req, res, next)`

- Create `backend/src/services/reportService.js`.
  - `getVehicleSummary(filters)`
  - `getFuelSummary(filters)`
  - `getWorkOrderSummary(filters)`
  - `getComplianceSummary(filters)`

- Create `backend/src/routes/reportRoutes.js`.
  - `GET /api/reports/vehicles`
  - `GET /api/reports/fuel`
  - `GET /api/reports/work-orders`
  - `GET /api/reports/compliance`

- Update `backend/src/app.js`.
  - Add `app.use("/api/reports", reportRoutes);`

- Supported query params:
  - `from`
  - `to`
  - `vehicleId`
  - `status`

- Fuel report response:
  - total quantity
  - total cost
  - average unit cost
  - rows grouped by vehicle or date

- Work order report response:
  - total work orders
  - open count
  - completed count
  - total cost
  - rows grouped by status or vehicle

- Compliance report response:
  - valid count
  - expiring soon count
  - expired count
  - rows by document status

- Vehicle report response:
  - total vehicles
  - active count
  - in maintenance count
  - out of service count

- Role protection:
  - `ADMIN`: full report access.
  - `TECHNICIAN`: no full reports in the current app; assigned work-order stats belong on the Technician dashboard.
  - `DRIVER`: no full reports in the current app; own fuel/fault activity belongs on Driver pages/dashboard.
  - Protect every report endpoint with `requireRole("ADMIN")` unless a future scoped report is deliberately added.

- Test in Postman:
  - Call each report endpoint.
  - Test date range filters.
  - Confirm empty database returns zeros and empty arrays.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/report.ts`.
  - `ReportFilters`
  - `VehicleReport`
  - `FuelReport`
  - `WorkOrderReport`
  - `ComplianceReport`

- Create `frontend/src/services/reportService.ts`.
  - `getVehicleReport(filters)`
  - `getFuelReport(filters)`
  - `getWorkOrderReport(filters)`
  - `getComplianceReport(filters)`

- Create `frontend/src/hooks/useReports.ts`.
  - Accept report type and filters.
  - Return data, loading, error, reload.

- Create `frontend/src/pages/Reports.tsx`.
  - Admin-only route.
  - Report type tabs:
    - Vehicles
    - Fuel
    - Work Orders
    - Compliance
  - Filters:
    - date range
    - vehicle
    - status where applicable
  - Summary cards.
  - Chart area.
  - Data table.

- Create components:
  - `frontend/src/components/reports/ReportFilters.tsx`
  - `frontend/src/components/reports/ReportSummaryCards.tsx`
  - `frontend/src/components/reports/ReportTable.tsx`
  - `frontend/src/components/reports/ReportChart.tsx`

- Use Chart.js or Recharts:
  - Bar chart for fuel cost by vehicle.
  - Doughnut chart for work order status.
  - Doughnut chart for compliance status.

- Optional CSV export:
  - Create `frontend/src/utils/exportCsv.ts`.
  - Export visible table rows only.
  - Keep PDF/Excel export out of the current semester scope.

- Premium UI requirements:
  - Reports page should feel like a polished analytics dashboard.
  - Use filters in a compact toolbar, not scattered controls.
  - Use chart cards and summary cards with consistent spacing.
  - Make empty reports look intentional with helpful empty states.
  - Use restrained colors and readable chart labels.

- Acceptance checks:
  - User can switch report tabs.
  - Filters call backend with query params.
  - Summary cards update.
  - At least one chart renders.
  - Empty data does not break the UI.
  - Technician and Driver users cannot access report routes or report APIs.
