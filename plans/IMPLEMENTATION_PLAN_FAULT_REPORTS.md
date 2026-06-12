# Implementation Plan: Fault Reports

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: driver submits vehicle fault report, admin reviews it, and admin can convert it to a work order manually.

## 1. DB RELATED CHANGES

- Confirm `backend/prisma/schema.prisma` has `FaultReport`.
- Required fields:
  - `id`
  - `vehicleId`
  - `driverId`
  - `reporterId`
  - `workOrderId`
  - `urgency`
  - `description`
  - `status`
  - `photoPath`
  - `createdAt`
  - `updatedAt`
- Required enums:
  - `FaultUrgency`
    - `LOW`
    - `MEDIUM`
    - `HIGH`
  - `FaultReportStatus`
    - `NEW`
    - `REVIEWED`
    - `CONVERTED_TO_WORK_ORDER`
    - `CLOSED`
- Relationships:
  - Fault report belongs to vehicle.
  - Fault report optionally belongs to driver.
  - Fault report optionally belongs to reporting user.
  - Fault report optionally links to one work order.
- Indexes:
  - `vehicleId`
  - `status`

## 2. BACKEND RELATED CHANGES

- Optional dependency if implementing photo upload:
  - Use `multer`, same upload middleware style as compliance documents.

- Create `backend/src/controllers/faultReportController.js`.
  - `listFaultReports(req, res, next)`
    - Query params:
      - `status`
      - `urgency`
      - `vehicleId`
      - `driverId`
  - `createFaultReport(req, res, next)`
    - Validate vehicle exists.
    - Save description and urgency.
    - If authenticated driver is linked later, set driver/reporter.
  - `updateFaultReportStatus(req, res, next)`
    - Admin can set `REVIEWED` or `CLOSED`.
  - `convertFaultReportToWorkOrder(req, res, next)`
    - Create work order from fault report details.
    - Link new work order to fault report.
    - Set status to `CONVERTED_TO_WORK_ORDER`.

- Create `backend/src/services/faultReportService.js`.
  - `findFaultReports(filters)`
  - `createFaultReport(data)`
  - `updateFaultReportStatus(id, status)`
  - `convertToWorkOrder(id, workOrderData)`

- Create `backend/src/routes/faultReportRoutes.js`.
  - `GET /api/fault-reports`
  - `POST /api/fault-reports`
  - `PATCH /api/fault-reports/:id/status`
  - `POST /api/fault-reports/:id/convert-to-work-order`

- Update `backend/src/app.js`.
  - Add `app.use("/api/fault-reports", faultReportRoutes);`

- Role protection:
  - `DRIVER`: create fault report.
  - `ADMIN`: list, review, close, convert.
  - `TECHNICIAN`: view linked work order, not fault management.

- Test in Postman:
  - Create fault report.
  - List new reports.
  - Mark reviewed.
  - Convert to work order.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/faultReport.ts`.
  - `FaultUrgency`
  - `FaultReportStatus`
  - `FaultReport`
  - `FaultReportFormValues`
  - `FaultReportFilters`

- Create `frontend/src/services/faultReportService.ts`.
  - `getFaultReports(filters)`
  - `createFaultReport(values)`
  - `updateFaultReportStatus(id, status)`
  - `convertFaultReportToWorkOrder(id, payload)`

- Create `frontend/src/hooks/useFaultReports.ts`.
  - Load fault reports.
  - Manage filters.
  - Reload after status changes.

- Create `frontend/src/pages/FaultReports.tsx`.
  - Driver view:
    - submit fault report form
    - own submitted reports if supported
  - Admin view:
    - fault report queue
    - filters by status and urgency
    - review and convert actions

- Create `frontend/src/components/faultReports/FaultReportForm.tsx`.
  - Vehicle select.
  - Urgency.
  - Description.
  - Optional photo input.

- Create `frontend/src/components/faultReports/FaultReportTable.tsx`.
  - Columns:
    - vehicle
    - driver/reporter
    - urgency
    - status
    - created date
    - actions

- Create `frontend/src/components/faultReports/ConvertToWorkOrderModal.tsx`.
  - Allows admin to choose:
    - technician
    - priority
    - due date
    - service type
  - Pre-fill description from fault report.

- Premium UI requirements:
  - Fault reports should feel urgent but organized.
  - Use urgency colors:
    - Low: neutral
    - Medium: warning
    - High: danger
  - Driver form should be simple and fast.
  - Admin queue should be compact and action-oriented.

- Acceptance checks:
  - Driver can submit fault report.
  - Admin can review report.
  - Admin can convert report to work order.
  - Converted report links to created work order.
