# VMMS User Features and Flows

This guide defines the practical scope of the Vehicle & Maintenance Management System (VMMS) for a 6th semester web engineering project. It is based on the lab concepts already covered: HTML, CSS, Bootstrap, JavaScript, JSON, async API calls, React, React Router, hooks, Express APIs, PostgreSQL, Prisma, and Git/GitHub.

The goal is to build a complete but realistic system, not a large commercial SaaS platform.

## 1. Project Scope Decision

VMMS will be built as a single-organization fleet management web application.

The project should demonstrate:

- Responsive frontend screens using React, Bootstrap 5, and React Router.
- Reusable React components for forms, tables, cards, badges, and layouts.
- React hooks for state, API loading, shared auth data, and calculated values.
- Backend REST APIs using Node.js and Express.js.
- PostgreSQL database design with Prisma models, relations, and migrations.
- Authentication using email/password, JWT, and bcrypt.
- Basic role-based access.
- CRUD operations for the main VMMS modules.
- Simple dashboards and reports using stored data.
- Git/GitHub workflow with branches and commits.

The project should not try to become a full enterprise fleet platform. Features such as billing, multi-tenant SaaS management, GPS tracking, IoT/OBD integrations, mobile apps, AI prediction, SMS gateways, and advanced accounting integrations are outside the semester scope.

## 2. Selected Tech Stack

Use the stack from the lab guide:

```text
Frontend: React + TypeScript + Bootstrap 5
Build Tool: Vite
Routing: React Router DOM
State: React hooks
Backend: Node.js + Express.js
Database: PostgreSQL
ORM: Prisma
Authentication: JWT + bcrypt
API Format: JSON over REST
Charts: Chart.js or Recharts
Testing Tool: Postman or Thunder Client
Version Control: Git + GitHub
```

TypeScript is recommended because it helps keep a larger React project organized. If time becomes short, plain React with JavaScript is acceptable, but the final stack should still use PostgreSQL and Prisma on the backend.

## 3. User Roles

Keep the role system simple. Three roles are enough for the project.

### Admin or Fleet Manager

This is the main user of the system.

Responsibilities:

- Manage vehicles.
- Manage drivers.
- Assign drivers to vehicles.
- Create maintenance schedules.
- Create and review work orders.
- Review fuel logs.
- Upload and track compliance documents.
- View dashboard and reports.
- Manage basic users if implemented.

### Technician

The Technician handles maintenance jobs.

Responsibilities:

- View assigned work orders.
- Update work order status.
- Add repair notes, labor hours, and cost.
- Mark work orders as completed.

### Driver

The Driver records vehicle activity.

Responsibilities:

- View assigned vehicle.
- Submit fault reports.
- Add fuel logs.
- View their own submitted records.

### Out of Scope Roles

These roles are useful in a real product but should not be built in Phase 1:

- Super Admin.
- Finance user.
- Executive user.
- Viewer or Auditor.
- Subscription/billing manager.

Their needs can be handled later through reports or a future read-only role.

## 4. Phase 1 Feature Scope

Phase 1 should be the final semester project scope.

### 4.1 Authentication and Basic Access

Included:

- Register user.
- Login with email and password.
- Hash password using bcrypt.
- Return JWT after successful login.
- Store logged-in user role.
- Protect frontend routes.
- Show/hide navigation links based on role.
- Logout.

Not included:

- Email verification.
- Google/Microsoft login.
- Multi-factor authentication.
- Password reset by email.
- Subscription-based access.

Why this scope fits:

- Demonstrates HTML forms, validation, React state, API calls, JSON, Express routes, PostgreSQL users table, Prisma queries, JWT, and bcrypt.

### 4.2 Dashboard

Included dashboard cards:

- Total vehicles.
- Active vehicles.
- Vehicles in maintenance.
- Total drivers.
- Open work orders.
- Completed work orders.
- Fuel cost this month.
- Expiring documents count.

Optional chart:

- Monthly fuel cost chart.
- Work order status chart.

Not included:

- Real-time live dashboard.
- Advanced executive analytics.
- Predictive maintenance analytics.

Why this scope fits:

- Demonstrates Bootstrap cards, React components, `useEffect` for API loading, `useMemo` for totals, and simple backend report endpoints.

### 4.3 Vehicle Management

Included:

- Add vehicle.
- View vehicle list.
- Search/filter vehicles by status or registration number.
- View vehicle detail.
- Edit vehicle.
- Delete vehicle if it has no important related records, or soft-delete it by status.

Vehicle fields:

- Registration number.
- Make.
- Model.
- Year.
- VIN or chassis number.
- Fuel type.
- Category.
- Current odometer.
- Status.

Vehicle statuses:

- Active.
- In Maintenance.
- Out of Service.

Not included:

- Decommissioning workflow.
- Vehicle purchase/asset depreciation.
- Advanced ownership and leasing records.

Why this scope fits:

- Demonstrates forms, tables, Bootstrap layout, React CRUD screens, Express REST endpoints, Prisma model relations, and PostgreSQL persistence.

### 4.4 Driver Management and Assignment

Included:

- Add driver.
- View driver list.
- Edit driver.
- Delete driver if not assigned, or mark inactive.
- Assign one active driver to one vehicle.
- View assignment history in a simple table.

Driver fields:

- Full name.
- CNIC or national ID.
- License number.
- License expiry date.
- Phone number.
- Address.
- Status.

Not included:

- Driver attendance.
- Payroll.
- Performance scoring.
- Advanced shift scheduling.

Why this scope fits:

- Demonstrates relational database design: drivers, vehicles, and vehicle assignments.

### 4.5 Maintenance Schedules

Included:

- Create a maintenance schedule for a vehicle.
- Select service type.
- Set next due date.
- Set next due odometer.
- Show schedules due soon.
- Allow Fleet Manager to create a work order from a schedule manually.

Maintenance schedule fields:

- Vehicle.
- Service type.
- Next due date.
- Next due odometer.
- Notes.
- Status.

Not included:

- Automatic background job creation.
- Complex recurring schedule engine.
- Advanced maintenance templates.

Why this scope fits:

- Keeps the scheduling concept useful but avoids background automation complexity.

### 4.6 Work Order Management

Included:

- Create work order.
- Assign work order to a technician.
- View work order list.
- Filter by status and priority.
- Update status.
- Add labor hours, cost, and notes.
- Mark completed.

Work order statuses:

- Open.
- In Progress.
- Pending Parts.
- Completed.
- Closed.

Work order fields:

- Vehicle.
- Technician.
- Priority.
- Service type.
- Description.
- Due date.
- Labor hours.
- Cost.
- Completion notes.

Not included:

- Full parts inventory.
- Vendor management.
- Purchase orders.
- Digital signatures.

Why this scope fits:

- Demonstrates conditions, status badges, protected role actions, CRUD APIs, and relational data.

### 4.7 Fault Reporting

Included:

- Driver submits a fault report.
- Fleet Manager reviews fault reports.
- Fleet Manager can create a work order from a fault report.

Fault report fields:

- Vehicle.
- Driver.
- Urgency.
- Description.
- Status.
- Optional photo upload if time allows.

Fault report statuses:

- New.
- Reviewed.
- Converted to Work Order.
- Closed.

Not included:

- Automatic work order creation.
- SMS/email alerts.
- Advanced photo annotation.

Why this scope fits:

- Demonstrates driver role flow, forms, API submission, and linking one record to another.

### 4.8 Fuel Logs

Included:

- Add fuel log.
- View fuel log list.
- Filter by vehicle and date.
- Calculate total fuel cost.
- Calculate simple fuel efficiency when odometer data is available.

Fuel log fields:

- Vehicle.
- Driver.
- Date.
- Fuel type.
- Quantity.
- Unit cost.
- Total amount.
- Odometer reading.

Not included:

- Fraud detection.
- Fuel card integration.
- Automatic abnormal usage alerts.

Why this scope fits:

- Demonstrates number input, date input, calculations, arrays, `reduce`, API CRUD, and reports.

### 4.9 Compliance Documents

Included:

- Add document record for a vehicle.
- Upload file if time allows.
- Track issue date and expiry date.
- Show document status as Valid, Expiring Soon, or Expired.
- Show expiring/expired count on dashboard.

Document fields:

- Vehicle.
- Document type.
- Document number.
- Issue date.
- Expiry date.
- File path or file name.
- Status.

Not included:

- Email reminders.
- SMS reminders.
- Cloud file storage.
- Document approval workflow.

Why this scope fits:

- Demonstrates file input, date handling, conditional status colors, backend metadata storage, and dashboard counts.

### 4.10 Reports

Included reports:

- Vehicle summary.
- Work order summary.
- Fuel cost summary.
- Compliance status summary.

Included filters:

- Date range.
- Vehicle.
- Status.

Optional:

- Export table data as CSV.

Not included:

- PDF export.
- Excel export.
- Advanced financial dashboards.
- Total cost of ownership calculations.

Why this scope fits:

- Demonstrates tables, date filtering, JSON data, backend report endpoints, and simple charts.

### 4.11 Notifications

Keep notifications simple.

Included:

- In-app alert list on dashboard.
- Due maintenance count.
- Expiring document count.
- Open work order count.
- New fault report count.

Not included:

- Email notifications.
- SMS notifications.
- Push notifications.
- Real-time WebSocket alerts.

Why this scope fits:

- Gives the user useful alerts without adding external services.

## 5. Suggested Pages

Frontend routes:

```text
/login
/register
/dashboard
/vehicles
/vehicles/:id
/drivers
/drivers/:id
/assignments
/maintenance-schedules
/work-orders
/work-orders/:id
/fault-reports
/fuel-logs
/compliance-documents
/reports
/settings
```

For a smaller version, combine detail pages into modals or side panels instead of separate routes.

## 6. Suggested Database Tables

Core Prisma models:

- `User`
- `Role`
- `Vehicle`
- `Driver`
- `VehicleAssignment`
- `MaintenanceSchedule`
- `WorkOrder`
- `FaultReport`
- `FuelLog`
- `ComplianceDocument`

Optional models:

- `Notification`
- `AuditLog`

Recommended relationship examples:

- One `Vehicle` has many `FuelLog` records.
- One `Vehicle` has many `WorkOrder` records.
- One `Vehicle` has many `ComplianceDocument` records.
- One `Driver` has many `FuelLog` records.
- One `Driver` can have many `VehicleAssignment` records over time.
- One `Technician` user can have many assigned `WorkOrder` records.
- One `FaultReport` can optionally link to one `WorkOrder`.

## 7. Suggested API Scope

Keep the API REST-based and easy to test in Postman.

```text
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/dashboard/summary

GET    /api/vehicles
POST   /api/vehicles
GET    /api/vehicles/:id
PUT    /api/vehicles/:id
DELETE /api/vehicles/:id

GET    /api/drivers
POST   /api/drivers
GET    /api/drivers/:id
PUT    /api/drivers/:id
DELETE /api/drivers/:id

GET    /api/assignments
POST   /api/assignments
PATCH  /api/assignments/:id/end

GET    /api/maintenance-schedules
POST   /api/maintenance-schedules
PUT    /api/maintenance-schedules/:id
DELETE /api/maintenance-schedules/:id

GET    /api/work-orders
POST   /api/work-orders
GET    /api/work-orders/:id
PATCH  /api/work-orders/:id/status
PUT    /api/work-orders/:id
DELETE /api/work-orders/:id

GET    /api/fault-reports
POST   /api/fault-reports
PATCH  /api/fault-reports/:id/status

GET    /api/fuel-logs
POST   /api/fuel-logs
PUT    /api/fuel-logs/:id
DELETE /api/fuel-logs/:id

GET    /api/compliance-documents
POST   /api/compliance-documents
PUT    /api/compliance-documents/:id
DELETE /api/compliance-documents/:id

GET    /api/reports/vehicles
GET    /api/reports/fuel
GET    /api/reports/work-orders
GET    /api/reports/compliance
```

If this still feels large during implementation, remove delete endpoints first and use status changes instead.

## 8. Main User Flows

### Flow 1: User Registers and Logs In

1. User opens Register.
2. User enters name, email, password, and role.
3. Backend hashes password using bcrypt.
4. Backend saves the user in PostgreSQL using Prisma.
5. User logs in.
6. Backend verifies password and returns a JWT.
7. Frontend stores the session and opens the dashboard.

### Flow 2: Fleet Manager Adds a Vehicle

1. Fleet Manager opens Vehicles.
2. Fleet Manager selects Add Vehicle.
3. Fleet Manager enters registration number, make, model, year, fuel type, odometer, and status.
4. Frontend validates required fields.
5. Backend saves the vehicle through Prisma.
6. Vehicle appears in the vehicle list.

### Flow 3: Fleet Manager Assigns Driver to Vehicle

1. Fleet Manager opens Assignments.
2. Fleet Manager selects a driver.
3. Fleet Manager selects a vehicle.
4. System checks if the vehicle already has an active assignment.
5. Assignment is saved.
6. Driver can see the assigned vehicle.

### Flow 4: Driver Submits Fault Report

1. Driver opens Fault Reports.
2. Driver selects assigned vehicle.
3. Driver enters urgency and description.
4. Driver submits the report.
5. Fleet Manager sees the new report.
6. Fleet Manager reviews it and may create a work order.

### Flow 5: Fleet Manager Creates Work Order

1. Fleet Manager opens Work Orders.
2. Fleet Manager selects Add Work Order.
3. Fleet Manager chooses vehicle, technician, priority, service type, and due date.
4. Backend saves the work order.
5. Technician sees the assigned work order.

### Flow 6: Technician Completes Work Order

1. Technician opens assigned work order.
2. Technician changes status to In Progress.
3. Technician adds labor hours, cost, and notes.
4. Technician marks the work order as Completed.
5. Fleet Manager can review and close the work order.
6. Completed work appears in vehicle maintenance history.

### Flow 7: Driver or Fleet Manager Adds Fuel Log

1. User opens Fuel Logs.
2. User selects vehicle and enters fuel details.
3. System calculates total amount from quantity and unit cost.
4. Backend saves the fuel log.
5. Fuel report updates totals.

### Flow 8: Fleet Manager Tracks Compliance Document

1. Fleet Manager opens Compliance Documents.
2. Fleet Manager selects vehicle and document type.
3. Fleet Manager enters issue date and expiry date.
4. Optional file is uploaded if file upload is implemented.
5. System calculates status as Valid, Expiring Soon, or Expired.
6. Dashboard shows expiring and expired documents.

### Flow 9: Fleet Manager Views Reports

1. Fleet Manager opens Reports.
2. Fleet Manager selects report type.
3. Fleet Manager applies date or vehicle filter.
4. Frontend requests report data from the backend.
5. Report table and chart are displayed.

## 9. What To Build First

Build in this order:

1. Project setup with React, Vite, Bootstrap, Express, Prisma, and PostgreSQL.
2. Authentication and protected routes.
3. Dashboard layout with static cards.
4. Vehicle CRUD.
5. Driver CRUD.
6. Vehicle assignment.
7. Work orders.
8. Fuel logs.
9. Compliance documents.
10. Fault reports.
11. Maintenance schedules.
12. Reports and charts.
13. Polish, validation, responsive design, and GitHub documentation.

This order gives you a working project early. Vehicles and drivers are the foundation, then the other modules connect to them.

## 10. What a Normal User Should Remember

- VMMS manages vehicles, drivers, maintenance work, fuel logs, documents, and basic reports.
- Fleet Managers control most records.
- Drivers submit fault reports and fuel logs.
- Technicians update assigned work orders.
- The dashboard shows important counts and alerts.
- The system stores data in PostgreSQL through Prisma.
- The frontend communicates with the backend using JSON APIs.

## 11. Future Features

These are good ideas, but they should not be part of the main 6th semester scope.

- Multi-organization SaaS tenant management.
- Subscription plans and billing.
- Email verification and password reset.
- Google or Microsoft login.
- Multi-factor authentication.
- Email, SMS, or push notifications.
- GPS real-time tracking.
- IoT or OBD-II telematics integration.
- Native Android or iOS apps.
- Parts inventory and purchase orders.
- Vendor management.
- PDF and Excel export.
- Accounting software integration.
- AI-based predictive maintenance.
- Advanced executive analytics.
- Audit log UI.

These can be mentioned in the proposal as future enhancements, but the actual implementation should stay focused on the Phase 1 scope above.
