# Implementation Plan: Work Orders

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: create work orders, assign technician, update status, add labor/cost/notes, and close completed work.

## 1. DB RELATED CHANGES

- Confirm `backend/prisma/schema.prisma` has `WorkOrder`.
- Required fields:
  - `id`
  - `vehicleId`
  - `technicianId`
  - `maintenanceScheduleId`
  - `priority`
  - `status`
  - `serviceType`
  - `description`
  - `dueDate`
  - `laborHours`
  - `cost`
  - `completionNotes`
  - `createdAt`
  - `updatedAt`
- Required enums:
  - `WorkOrderPriority`
    - `LOW`
    - `MEDIUM`
    - `HIGH`
    - `URGENT`
  - `WorkOrderStatus`
    - `OPEN`
    - `IN_PROGRESS`
    - `PENDING_PARTS`
    - `COMPLETED`
    - `CLOSED`
- Relationships:
  - Work order belongs to vehicle.
  - Work order optionally belongs to technician user.
  - Work order optionally belongs to maintenance schedule.
  - Fault report can optionally link to work order.
- Indexes:
  - `vehicleId`
  - `technicianId`
  - `status`

## 2. BACKEND RELATED CHANGES

- Create `backend/src/controllers/workOrderController.js`.
  - `listWorkOrders(req, res, next)`
    - Query params:
      - `status`
      - `priority`
      - `vehicleId`
      - `technicianId`
  - `getWorkOrderById(req, res, next)`
  - `createWorkOrder(req, res, next)`
  - `updateWorkOrder(req, res, next)`
  - `updateWorkOrderStatus(req, res, next)`
  - `deleteWorkOrder(req, res, next)`

- Create `backend/src/services/workOrderService.js`.
  - Keep Prisma queries here.
  - Include vehicle and technician details in list/detail responses.

- Create `backend/src/routes/workOrderRoutes.js`.
  - `GET /api/work-orders`
  - `POST /api/work-orders`
  - `GET /api/work-orders/:id`
  - `PUT /api/work-orders/:id`
  - `PATCH /api/work-orders/:id/status`
  - `DELETE /api/work-orders/:id`

- Status transition rules:
  - `OPEN` -> `IN_PROGRESS`
  - `IN_PROGRESS` -> `PENDING_PARTS`
  - `PENDING_PARTS` -> `IN_PROGRESS`
  - `IN_PROGRESS` -> `COMPLETED`
  - `COMPLETED` -> `CLOSED`
  - Keep rules simple; do not over-engineer.

- Update vehicle status:
  - Optional but useful: when a work order is `IN_PROGRESS`, set vehicle to `IN_MAINTENANCE`.
  - When all active work orders for a vehicle are closed, allow status back to `ACTIVE`.

- Role protection:
  - `ADMIN`: create, edit, assign, close.
  - `TECHNICIAN`: view assigned work orders and update status/details.
  - `DRIVER`: no work order management access.

- Test in Postman:
  - Create work order.
  - Filter by status.
  - Assign technician.
  - Update status.
  - Complete with labor/cost/notes.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/workOrder.ts`.
  - `WorkOrderStatus`
  - `WorkOrderPriority`
  - `WorkOrder`
  - `WorkOrderFormValues`
  - `WorkOrderFilters`

- Create `frontend/src/services/workOrderService.ts`.
  - `getWorkOrders(filters)`
  - `getWorkOrder(id)`
  - `createWorkOrder(values)`
  - `updateWorkOrder(id, values)`
  - `updateWorkOrderStatus(id, status)`
  - `deleteWorkOrder(id)`

- Create `frontend/src/hooks/useWorkOrders.ts`.
  - List loading and filtering.

- Create `frontend/src/pages/WorkOrders.tsx`.
  - Header with Create Work Order.
  - Status tabs or segmented control.
  - Priority filter.
  - Work order table.

- Create `frontend/src/pages/WorkOrderDetail.tsx`.
  - Detail view with status timeline.
  - Vehicle info.
  - Technician info.
  - Labor/cost/completion notes section.

- Create `frontend/src/components/workOrders/WorkOrderForm.tsx`.
  - Vehicle select.
  - Technician select.
  - Priority select.
  - Service type.
  - Due date.
  - Description.

- Create `frontend/src/components/workOrders/WorkOrderTable.tsx`.
  - Columns:
    - vehicle
    - service type
    - priority
    - status
    - due date
    - technician
    - actions

- Create `frontend/src/components/workOrders/WorkOrderStatusActions.tsx`.
  - Buttons/dropdown for status changes.
  - Hide actions based on role.

- Premium UI requirements:
  - Work orders should feel like an operations command center.
  - Use status tabs, priority colors, due-date warnings, and clean row actions.
  - Avoid cramped forms; use sections for job info and completion info.
  - Make high/urgent work visually obvious but not noisy.

- Acceptance checks:
  - Admin creates work order.
  - Technician can update assigned order.
  - Status badges update correctly.
  - Completed work order captures labor/cost/notes.
