# Implementation Plan: Vehicle Assignment

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: assign one active driver to one vehicle, show assignment history, and end an active assignment.

## 1. DB RELATED CHANGES

- Confirm `backend/prisma/schema.prisma` has `VehicleAssignment`.
- Required fields:
  - `id`
  - `vehicleId`
  - `driverId`
  - `startDate`
  - `endDate`
  - `status`
  - `createdAt`
  - `updatedAt`
- Required enum:
  - `AssignmentStatus`
    - `ACTIVE`
    - `ENDED`
- Relationships:
  - `VehicleAssignment` belongs to `Vehicle`.
  - `VehicleAssignment` belongs to `Driver`.
- Indexes:
  - `(vehicleId, status)`
  - `(driverId, status)`
- Business rule:
  - Only one active assignment per vehicle.
  - Prefer enforcing this in backend service logic for Phase 1.
  - Optional advanced DB rule later: partial unique index for active vehicle assignment.

## 2. BACKEND RELATED CHANGES

- Create `backend/src/controllers/assignmentController.js`.
  - `listAssignments(req, res, next)`
    - Query params:
      - `status`
      - `vehicleId`
      - `driverId`
  - `createAssignment(req, res, next)`
    - Validate vehicle and driver exist.
    - Check vehicle has no active assignment.
    - Check driver status is active.
    - Create assignment.
  - `endAssignment(req, res, next)`
    - Set `status` to `ENDED`.
    - Set `endDate`.

- Create `backend/src/services/assignmentService.js`.
  - `findAssignments(filters)`
  - `createAssignment(data)`
  - `endAssignment(id)`
  - `getActiveAssignmentForVehicle(vehicleId)`

- Create `backend/src/routes/assignmentRoutes.js`.
  - `GET /api/assignments`
  - `POST /api/assignments`
  - `PATCH /api/assignments/:id/end`

- Update `backend/src/app.js`.
  - Add `app.use("/api/assignments", assignmentRoutes);`

- Use Prisma `include`:
  - Include vehicle registration.
  - Include driver full name.

- Role protection:
  - `ADMIN`: full access.
  - `DRIVER`: can view own assignment later if auth user-driver relation is added.

- Test in Postman:
  - Assign driver to vehicle.
  - Try assigning another active driver to same vehicle and expect validation error.
  - End assignment.
  - Assign a new driver after ending old assignment.

## 3. FRONTEND RELATED CHANGES

- Create `frontend/src/types/assignment.ts`.
  - `AssignmentStatus`
  - `VehicleAssignment`
  - `AssignmentFormValues`

- Create `frontend/src/services/assignmentService.ts`.
  - `getAssignments(filters)`
  - `createAssignment(values)`
  - `endAssignment(id)`

- Create `frontend/src/hooks/useAssignments.ts`.
  - Load assignment list.
  - Support status filter.
  - Reload after create/end.

- Create `frontend/src/pages/Assignments.tsx`.
  - Page header.
  - Assign Driver button.
  - Active assignments table.
  - Assignment history section.

- Create `frontend/src/components/assignments/AssignmentForm.tsx`.
  - Vehicle dropdown.
  - Driver dropdown.
  - Start date.
  - Load active vehicles and active drivers from existing services.

- Create `frontend/src/components/assignments/AssignmentTable.tsx`.
  - Columns:
    - vehicle
    - driver
    - start date
    - end date
    - status
    - actions

- Add action:
  - End Assignment button for active rows.
  - Confirmation before ending.

- Premium UI requirements:
  - Use a clean split between active assignments and history.
  - Use status badges and compact date formatting.
  - Dropdowns should be searchable later if lists grow, but regular selects are enough for Phase 1.
  - Keep the workflow obvious: select driver, select vehicle, save.

- Acceptance checks:
  - Admin can assign driver to vehicle.
  - Duplicate active vehicle assignment is blocked.
  - Assignment can be ended.
  - Ended assignments move to history.
