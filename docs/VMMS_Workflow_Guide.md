# VMMS Workflow Guide

This guide explains how people use the Vehicle Maintenance Management System in daily work. It avoids technical language and focuses on what each user does inside the application.

## 1. Main Idea

VMMS helps a fleet team answer simple operational questions:

- Which vehicles are available?
- Which driver is using which vehicle?
- Which vehicles need maintenance?
- Which repair jobs are open?
- Which documents are expired or expiring soon?
- How much fuel is being used?
- Which faults have drivers reported?
- What can the fleet manager see in reports?

The system has three user types:

- Admin or Fleet Manager
- Technician
- Driver

Each user only sees the pages needed for their work.

## 2. Demo Login Accounts

Use these accounts for project demonstration.

| User Type | Email | Password |
|---|---|---|
| Admin | `admin@vmms.local` | `Ahmed@123` |
| Technician | `ahmedshikari@vmms.local` | `Shikari@123` |
| Technician | `sara.technician@vmms.local` | `Tech@12345` |
| Driver | `ahmeddriver@vmms.local` | `Driver@123` |
| Driver | `bilal.driver@vmms.local` | `Driver@12345` |

## 3. Starting the System

1. Open the VMMS website in the browser.
2. The user sees the login page.
3. The user enters email and password.
4. VMMS opens the dashboard for that user's role.

If the user is an Admin, they see the full fleet management menu.

If the user is a Technician, they see their maintenance work.

If the user is a Driver, they see driver-related pages such as My Vehicle, Fault Reports, and Fuel Logs.

## 4. Admin Workflow

The Admin is usually the fleet manager. This user controls most records in the system.

### 4.1 Admin Checks the Dashboard

1. Admin logs in.
2. Admin opens the Dashboard.
3. Admin reviews the summary cards.

The dashboard shows:

- Total vehicles.
- Active vehicles.
- Vehicles in maintenance.
- Total drivers.
- Open work orders.
- Completed work orders.
- Fuel cost this month.
- Expiring documents.

Admin uses this page to quickly understand fleet health.

### 4.2 Admin Adds or Updates a Vehicle

1. Admin opens Vehicles.
2. Admin clicks Add Vehicle.
3. Admin enters vehicle information:
   - Registration number.
   - Make.
   - Model.
   - Year.
   - VIN or chassis number.
   - Fuel type.
   - Category.
   - Current odometer.
   - Status.
4. Admin saves the vehicle.

After saving, the vehicle appears in the vehicle list.

Admin can also search, filter, view, edit, or delete vehicle records where allowed.

### 4.3 Admin Creates a Driver Profile

1. Admin opens Drivers.
2. Admin clicks Add Driver.
3. Admin enters:
   - Driver name.
   - License number.
   - License expiry.
   - CNIC or national ID.
   - Phone.
   - Address.
   - Status.
4. If the driver also needs to log in, Admin selects a linked Driver user from the dropdown.
5. Admin saves the driver.

The linked driver user is important because it allows that driver to log in and see their assigned vehicle.

### 4.4 Admin Assigns a Vehicle to a Driver

1. Admin opens Assignments.
2. Admin selects an active vehicle.
3. Admin selects an active driver.
4. Admin saves the assignment.

After this, the driver can log in and see the assigned vehicle on the My Vehicle page.

Only active vehicles and active drivers should be assigned.

### 4.5 Admin Creates a Maintenance Schedule

1. Admin opens Maintenance.
2. Admin clicks Add Schedule.
3. Admin selects a vehicle.
4. Admin enters:
   - Service type.
   - Next due date.
   - Next due odometer.
   - Notes.
5. Admin saves the schedule.

The schedule helps the fleet manager remember upcoming maintenance work.

### 4.6 Admin Creates a Work Order

1. Admin opens Work Orders.
2. Admin clicks Add Work Order.
3. Admin selects:
   - Vehicle.
   - Technician.
   - Priority.
   - Service type.
   - Due date.
4. Admin writes the job description.
5. Admin saves the work order.

After saving, the assigned Technician can see the work order in their account.

### 4.7 Admin Reviews Technician Work

1. Admin opens Work Orders.
2. Admin reviews the status of jobs.
3. Admin checks technician notes, labor hours, and cost.
4. When a completed job is accepted, Admin closes the work order.

Closing a work order means the fleet manager has reviewed the maintenance job.

### 4.8 Admin Tracks Compliance Documents

1. Admin opens Documents.
2. Admin clicks Add Document.
3. Admin selects a vehicle.
4. Admin enters:
   - Document type.
   - Document number.
   - Issue date.
   - Expiry date.
   - File reference if available.
5. Admin saves the document.

VMMS shows whether the document is:

- Valid.
- Expiring soon.
- Expired.

This helps avoid using vehicles with expired legal or compliance paperwork.

### 4.9 Admin Reviews Driver Fault Reports

1. Admin opens Fault Reports.
2. Admin reads new reports submitted by drivers.
3. Admin decides what action is needed.

Admin can:

- Mark a report as reviewed.
- Close the report if no repair is needed.
- Convert the report into a work order if maintenance is required.

When converted, the issue becomes a technician job.

### 4.10 Admin Reviews Fuel Logs

1. Admin opens Fuel Logs.
2. Admin reviews fuel entries.
3. Admin filters by vehicle or date if needed.
4. Admin checks fuel quantity, unit cost, and total amount.

Fuel logs help the fleet manager understand fuel spending.

### 4.11 Admin Uses Reports

1. Admin opens Reports.
2. Admin selects a report type:
   - Vehicles.
   - Fuel.
   - Work Orders.
   - Compliance.
3. Admin applies filters if needed.
4. VMMS shows charts, summary cards, and detailed rows.
5. Admin clicks Export Report to download a formatted PDF.

Reports are used for presentation, review, and decision-making.

### 4.12 Admin Uses Settings

1. Admin opens Settings.
2. Admin can update profile name.
3. Admin can change password.
4. Admin can change appearance preferences.
5. Admin can update organization preferences such as:
   - Organization name.
   - Contact details.
   - Report footer.
   - Warning days.
   - Currency.
   - Distance unit.

Settings help personalize the system for the fleet team.

## 5. Technician Workflow

The Technician handles maintenance jobs assigned by the Admin.

### 5.1 Technician Checks the Dashboard

1. Technician logs in.
2. Technician opens Dashboard.
3. Technician checks:
   - Assigned work orders.
   - Open jobs.
   - In-progress jobs.
   - Completed jobs.
   - Urgent jobs.
   - Jobs due soon.

This tells the Technician what needs attention first.

### 5.2 Technician Opens Work Orders

1. Technician opens Work Orders.
2. Technician sees only assigned work orders.
3. Technician opens a work order to review details.

The Technician cannot manage all fleet records. They focus only on their repair jobs.

### 5.3 Technician Updates Work Progress

1. Technician opens an assigned work order.
2. Technician changes the status when work starts.
3. Technician adds:
   - Labor hours.
   - Repair cost.
   - Completion notes.
4. Technician marks the work order as completed when the job is done.

After this, Admin can review and close it.

### 5.4 Technician Uses Settings

1. Technician opens Settings.
2. Technician can update profile name.
3. Technician can change password.
4. Technician can change appearance preferences.

## 6. Driver Workflow

The Driver records vehicle activity and reports issues.

### 6.1 Driver Checks the Dashboard

1. Driver logs in.
2. Driver opens Dashboard.
3. Driver checks submitted fault reports and their statuses.

This helps the Driver know whether reported issues are still open or already handled.

### 6.2 Driver Views Assigned Vehicle

1. Driver opens My Vehicle.
2. VMMS shows the vehicle assigned to that driver.
3. Driver can see details such as:
   - Registration number.
   - Vehicle make and model.
   - Vehicle status.
   - Current odometer.
   - Driver profile details.

If no vehicle appears, Admin needs to link the driver user to a driver profile and create an active assignment.

### 6.3 Driver Adds a Fuel Log

1. Driver opens Fuel Logs.
2. Driver enters:
   - Date.
   - Fuel type.
   - Quantity.
   - Unit cost.
   - Odometer reading.
3. VMMS calculates the total amount.
4. Driver saves the fuel log.

Fuel logs help the fleet manager track fuel spending and usage.

### 6.4 Driver Submits a Fault Report

1. Driver opens Fault Reports.
2. Driver selects the assigned vehicle.
3. Driver chooses urgency.
4. Driver writes what is wrong with the vehicle.
5. Driver submits the report.

Admin reviews the report later.

If the issue needs repair, Admin converts it into a work order for a Technician.

### 6.5 Driver Uses Settings

1. Driver opens Settings.
2. Driver can update profile name.
3. Driver can change password.
4. Driver can change appearance preferences.

## 7. Complete Maintenance Flow Example

This is a common real-life flow:

1. Driver notices a vehicle issue.
2. Driver submits a fault report.
3. Admin reviews the fault report.
4. Admin converts it into a work order.
5. Admin assigns the work order to a Technician.
6. Technician repairs the vehicle.
7. Technician marks the work order as completed.
8. Admin reviews the completed work.
9. Admin closes the work order.
10. The vehicle maintenance history is updated.

This flow shows how Driver, Admin, and Technician work together.

## 8. Complete Fuel Tracking Flow Example

1. Driver fills fuel in the assigned vehicle.
2. Driver opens Fuel Logs.
3. Driver enters fuel quantity and unit cost.
4. VMMS calculates total amount.
5. Admin later reviews all fuel logs.
6. Admin opens Reports and checks fuel cost summary.
7. Admin can export the fuel report as PDF.

## 9. Complete Compliance Flow Example

1. Admin adds a document for a vehicle.
2. Admin enters the expiry date.
3. VMMS calculates document status.
4. Dashboard shows document alerts when documents are expiring or expired.
5. Admin renews the document and updates the record.

This helps prevent missing important vehicle documents.

## 10. Complete Assignment Flow Example

1. Admin creates a Driver user account.
2. Admin creates a driver profile.
3. Admin links the driver profile to that user.
4. Admin assigns a vehicle to the driver.
5. Driver logs in.
6. Driver opens My Vehicle and sees the assigned vehicle.
7. Driver can now submit fuel logs and fault reports for that vehicle.

## 11. What Each Status Means

### Vehicle Status

- Active: Vehicle can be used.
- In Maintenance: Vehicle is being repaired or checked.
- Out of Service: Vehicle should not be used.

### Work Order Status

- Open: Job is created but not started.
- In Progress: Technician is working on it.
- Pending Parts: Work is waiting for parts.
- Completed: Technician finished the job.
- Closed: Admin reviewed and accepted the completed job.

### Fault Report Status

- New: Driver submitted it and Admin has not reviewed it yet.
- Reviewed: Admin checked it.
- Converted to Work Order: Admin turned it into a repair job.
- Closed: No further action is needed.

### Compliance Document Status

- Valid: Document is okay.
- Expiring Soon: Document needs attention soon.
- Expired: Document has passed its expiry date.

## 12. Best Demonstration Order

For a smooth project presentation, use this order:

1. Login as Admin.
2. Show role-based dashboard.
3. Show vehicles and driver profiles.
4. Show vehicle assignment.
5. Login as Driver and show My Vehicle.
6. Submit a fault report as Driver.
7. Login as Admin and convert the fault report into a work order.
8. Login as Technician and complete the assigned work order.
9. Login as Admin and close the work order.
10. Show fuel logs, documents, reports, and PDF export.
11. Show Settings and appearance preferences.

This order explains the complete purpose of VMMS clearly.
