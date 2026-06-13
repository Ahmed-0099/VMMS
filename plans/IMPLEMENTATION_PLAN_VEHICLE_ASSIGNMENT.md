# Implementation Plan: Vehicle Assignment

Source of truth:

- `docs/VMMS_User_Features_and_Flows.md`
- `docs/VMMS_Lab_Concepts_Tech_Stack_Guide.md`

Scope: Admin assigns one active driver to one vehicle, shows assignment history, ends active assignments, and exposes a read-only own-assignment lookup for Driver users once `Driver.userId` exists.

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
  - Prefer enforcing this in backend service logic for the current semester scope.
  - Optional advanced DB rule later: partial unique index for active vehicle assignment.
  - For Driver self-service, resolve the logged-in user to `Driver.userId` and then to active assignment.

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
  - `getMyActiveAssignment(req, res, next)`
    - For logged-in Driver users only.
    - Resolve linked driver profile.
    - Return active assignment with vehicle summary, or a clear empty state.

- Create `backend/src/services/assignmentService.js`.
  - `findAssignments(filters)`
  - `createAssignment(data)`
  - `endAssignment(id)`
  - `getActiveAssignmentForVehicle(vehicleId)`
  - `getActiveAssignmentForLoggedInDriver(userId)`

- Create `backend/src/routes/assignmentRoutes.js`.
  - `GET /api/assignments`
  - `POST /api/assignments`
  - `PATCH /api/assignments/:id/end`
  - `GET /api/assignments/my-active`

- Update `backend/src/app.js`.
  - Add `app.use("/api/assignments", assignmentRoutes);`

- Use Prisma `include`:
  - Include vehicle registration.
  - Include driver full name.

- Role protection:
  - `ADMIN`: full access.
  - `DRIVER`: read-only access to `/api/assignments/my-active` after the `Driver.userId` relation exists.
  - `TECHNICIAN`: no assignment management access.
  - Never allow `DRIVER` or `TECHNICIAN` to create or end assignments.

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
  - `getMyActiveAssignment()`
  - `createAssignment(values)`
  - `endAssignment(id)`

- Create `frontend/src/hooks/useAssignments.ts`.
  - Load assignment list.
  - Support status filter.
  - Reload after create/end.

- Create `frontend/src/pages/Assignments.tsx`.
  - Admin-only route.
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
  - Show actions only for Admin users.

- Premium UI requirements:
  - Use a clean split between active assignments and history.
  - Use status badges and compact date formatting.
  - Dropdowns should be searchable later if lists grow, but regular selects are enough for the current semester scope.
  - Keep the workflow obvious: select driver, select vehicle, save.

- Acceptance checks:
  - Admin can assign driver to vehicle.
  - Duplicate active vehicle assignment is blocked.
  - Assignment can be ended.
  - Ended assignments move to history.
  - Driver can read only their own active assignment when linked.
  - Driver and Technician cannot create or end assignments.
