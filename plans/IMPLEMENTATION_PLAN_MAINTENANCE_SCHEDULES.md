# Implementation Plan: Maintenance Schedules

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: create preventive maintenance schedule, show due schedules, and manually create a work order from a schedule.

## 1. DB RELATED CHANGES

- Confirm `backend/prisma/schema.prisma` has `MaintenanceSchedule`.
- Required fields:
  - `id`
  - `vehicleId`
  - `serviceType`
  - `nextDueDate`
  - `nextDueOdometer`
  - `notes`
  - `status`
  - `createdAt`
  - `updatedAt`
- Required enum:
  - `MaintenanceScheduleStatus`
    - `ACTIVE`
    - `DUE`
    - `COMPLETED`
    - `CANCELLED`
- Relationships:
  - Maintenance schedule belongs to vehicle.
  - Maintenance schedule can have many work orders.
- Indexes:
  - `vehicleId`
  - `status`
- Do not implement automatic background work order generation in the current semester scope.

## 2. BACKEND RELATED CHANGES

- Create `backend/src/utils/maintenanceStatus.js`.
  - `getScheduleStatus(schedule, vehicle)`
    - Due if current date is past `nextDueDate`.
    - Due if vehicle odometer is greater than or equal to `nextDueOdometer`.
    - Otherwise active.

- Create `backend/src/controllers/maintenanceScheduleController.js`.
  - `listSchedules(req, res, next)`
    - Query params:
      - `vehicleId`
      - `status`
      - `dueOnly`
  - `createSchedule(req, res, next)`
  - `updateSchedule(req, res, next)`
  - `deleteSchedule(req, res, next)`
  - `createWorkOrderFromSchedule(req, res, next)`

- Create `backend/src/services/maintenanceScheduleService.js`.
  - `findSchedules(filters)`
  - `createSchedule(data)`
  - `updateSchedule(id, data)`
  - `deleteSchedule(id)`
  - `createWorkOrderFromSchedule(id, payload)`

- Create `backend/src/routes/maintenanceScheduleRoutes.js`.
  - `GET /api/maintenance-schedules`
  - `POST /api/maintenance-schedules`
  - `PUT /api/maintenance-schedules/:id`
  - `DELETE /api/maintenance-schedules/:id`
  - `POST /api/maintenance-schedules/:id/create-work-order`

- Update `backend/src/app.js`.
  - Add `app.use("/api/maintenance-schedules", maintenanceScheduleRoutes);`

- Role protection:
  - `ADMIN`: full access.
  - `TECHNICIAN`: no standalone schedule management access in the current app; due assigned jobs should come through Work Orders and the Technician dashboard.
  - `DRIVER`: no access.
  - Never allow Technician or Driver users to create, edit, delete, or convert schedules to work orders.

- Test in Postman:
  - Create schedule.
  - List due schedules.
  - Update due date/odometer.
  - Create work order from schedule.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/maintenanceSchedule.ts`.
  - `MaintenanceScheduleStatus`
  - `MaintenanceSchedule`
  - `MaintenanceScheduleFormValues`
  - `MaintenanceScheduleFilters`

- Create `frontend/src/services/maintenanceScheduleService.ts`.
  - `getMaintenanceSchedules(filters)`
  - `createMaintenanceSchedule(values)`
  - `updateMaintenanceSchedule(id, values)`
  - `deleteMaintenanceSchedule(id)`
  - `createWorkOrderFromSchedule(id, payload)`

- Create `frontend/src/hooks/useMaintenanceSchedules.ts`.
  - Load schedules.
  - Manage filters.
  - Reload after create/update/delete.

- Create `frontend/src/pages/MaintenanceSchedules.tsx`.
  - Admin-only route.
  - Header with Add Schedule.
  - Due soon summary cards.
  - Filters:
    - vehicle
    - status
  - Schedule table.

- Create `frontend/src/components/maintenanceSchedules/MaintenanceScheduleForm.tsx`.
  - Vehicle select.
  - Service type.
  - Next due date.
  - Next due odometer.
  - Notes.
  - Status.

- Create `frontend/src/components/maintenanceSchedules/MaintenanceScheduleTable.tsx`.
  - Columns:
    - vehicle
    - service type
    - due date
    - due odometer
    - status
    - actions

- Create `frontend/src/components/maintenanceSchedules/CreateWorkOrderFromScheduleModal.tsx`.
  - Select technician.
  - Select priority.
  - Due date.
  - Description.

- Premium UI requirements:
  - Maintenance schedules should look calendar/operations focused.
  - Due items should stand out with warning colors.
  - Keep form simple; do not build a complex recurring schedule engine.
  - Use clean date and odometer formatting.

- Acceptance checks:
  - Admin creates schedule.
  - Due status is visible.
  - Admin can create work order from schedule.
  - Dashboard due maintenance count updates.
  - Non-admin users cannot access maintenance schedule management routes or write APIs.
