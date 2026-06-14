const prisma = require("../src/config/prisma");
const { getComplianceStatus } = require("../src/utils/documentStatus");
const { hashPassword } = require("../src/utils/password");

function daysFromToday(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}

function fixedDate(value) {
  return new Date(`${value}T12:00:00.000Z`);
}

async function seedRoles() {
  const roles = [
    { name: "ADMIN", description: "Fleet manager and system administrator" },
    { name: "TECHNICIAN", description: "Maintenance technician" },
    { name: "DRIVER", description: "Driver user" },
  ];

  const roleMap = {};

  for (const role of roles) {
    const savedRole = await prisma.role.upsert({
      where: { name: role.name },
      update: role,
      create: role,
    });

    roleMap[savedRole.name] = savedRole;
  }

  return roleMap;
}

async function upsertUser({ email, name, password, roleName }, roleMap) {
  const passwordHash = await hashPassword(password);

  return prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash,
      roleId: roleMap[roleName].id,
      status: "ACTIVE",
    },
    create: {
      name,
      email,
      passwordHash,
      roleId: roleMap[roleName].id,
      status: "ACTIVE",
    },
  });
}

async function seedUsers(roleMap) {
  const users = {
    admin: await upsertUser(
      {
        email: "admin@vmms.local",
        name: "Ahmed Admin",
        password: "Ahmed@123",
        roleName: "ADMIN",
      },
      roleMap,
    ),
    technicianAhmed: await upsertUser(
      {
        email: "ahmedshikari@vmms.local",
        name: "Ahmed Shikari",
        password: "Shikari@123",
        roleName: "TECHNICIAN",
      },
      roleMap,
    ),
    technicianSara: await upsertUser(
      {
        email: "sara.technician@vmms.local",
        name: "Sara Khan",
        password: "Tech@12345",
        roleName: "TECHNICIAN",
      },
      roleMap,
    ),
    driverAhmed: await upsertUser(
      {
        email: "ahmeddriver@vmms.local",
        name: "Ahmed Driver",
        password: "Driver@123",
        roleName: "DRIVER",
      },
      roleMap,
    ),
    driverBilal: await upsertUser(
      {
        email: "bilal.driver@vmms.local",
        name: "Bilal Ahmed",
        password: "Driver@12345",
        roleName: "DRIVER",
      },
      roleMap,
    ),
  };

  return users;
}

async function upsertLinkedDriver(user, data) {
  return prisma.driver.upsert({
    where: { userId: user.id },
    update: {
      fullName: data.fullName,
      cnic: data.cnic,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      phone: data.phone,
      address: data.address,
      status: data.status,
    },
    create: {
      id: data.id,
      userId: user.id,
      fullName: data.fullName,
      cnic: data.cnic,
      licenseNumber: data.licenseNumber,
      licenseExpiry: data.licenseExpiry,
      phone: data.phone,
      address: data.address,
      status: data.status,
    },
  });
}

async function upsertDriver(data) {
  return prisma.driver.upsert({
    where: { licenseNumber: data.licenseNumber },
    update: {
      fullName: data.fullName,
      cnic: data.cnic,
      licenseExpiry: data.licenseExpiry,
      phone: data.phone,
      address: data.address,
      status: data.status,
    },
    create: data,
  });
}

async function seedDrivers(users) {
  return {
    ahmed: await upsertLinkedDriver(users.driverAhmed, {
      id: "demo-driver-ahmed",
      fullName: "Ahmed Khan",
      cnic: "42101-1578799-3",
      licenseNumber: "LIC-12345",
      licenseExpiry: fixedDate("2030-06-01"),
      phone: "+92 300 1234567",
      address: "Gulberg III, Lahore",
      status: "ACTIVE",
    }),
    bilal: await upsertLinkedDriver(users.driverBilal, {
      id: "demo-driver-bilal",
      fullName: "Bilal Ahmed",
      cnic: "35202-4488112-7",
      licenseNumber: "LIC-77821",
      licenseExpiry: fixedDate("2031-02-18"),
      phone: "+92 321 7788990",
      address: "DHA Phase 6, Lahore",
      status: "ACTIVE",
    }),
    kamran: await upsertDriver({
      id: "demo-driver-kamran",
      fullName: "Kamran Ali",
      cnic: "42201-8899001-5",
      licenseNumber: "LIC-64092",
      licenseExpiry: fixedDate("2029-11-12"),
      phone: "+92 333 6409201",
      address: "North Nazimabad, Karachi",
      status: "ACTIVE",
    }),
    hassan: await upsertDriver({
      id: "demo-driver-hassan",
      fullName: "Hassan Raza",
      cnic: "33102-5566778-1",
      licenseNumber: "LIC-53108",
      licenseExpiry: fixedDate("2030-04-22"),
      phone: "+92 345 5310800",
      address: "Madina Town, Faisalabad",
      status: "ACTIVE",
    }),
    usman: await upsertDriver({
      id: "demo-driver-usman",
      fullName: "Usman Tariq",
      cnic: "61101-2266448-9",
      licenseNumber: "LIC-22405",
      licenseExpiry: fixedDate("2028-09-08"),
      phone: "+92 312 2240500",
      address: "G-11 Markaz, Islamabad",
      status: "ACTIVE",
    }),
  };
}

async function seedVehicles() {
  const vehicleRecords = [
    {
      id: "demo-vehicle-001",
      registrationNumber: "LEA-2458",
      make: "Toyota",
      model: "Corolla Altis",
      year: 2022,
      vin: "VMMSVIN0001",
      fuelType: "Hybrid",
      category: "Sedan",
      currentOdometer: 42150,
      status: "ACTIVE",
    },
    {
      id: "demo-vehicle-002",
      registrationNumber: "LEB-7821",
      make: "Suzuki",
      model: "Bolan",
      year: 2020,
      vin: "VMMSVIN0002",
      fuelType: "Petrol",
      category: "Van",
      currentOdometer: 68120,
      status: "ACTIVE",
    },
    {
      id: "demo-vehicle-003",
      registrationNumber: "ICT-3927",
      make: "Honda",
      model: "City",
      year: 2021,
      vin: "VMMSVIN0003",
      fuelType: "Petrol",
      category: "Sedan",
      currentOdometer: 51280,
      status: "ACTIVE",
    },
    {
      id: "demo-vehicle-004",
      registrationNumber: "RIN-1184",
      make: "Toyota",
      model: "Hilux",
      year: 2023,
      vin: "VMMSVIN0004",
      fuelType: "Diesel",
      category: "Pickup",
      currentOdometer: 28640,
      status: "ACTIVE",
    },
    {
      id: "demo-vehicle-005",
      registrationNumber: "KHI-7712",
      make: "Hino",
      model: "Dutro",
      year: 2019,
      vin: "VMMSVIN0005",
      fuelType: "Diesel",
      category: "Light Truck",
      currentOdometer: 92430,
      status: "IN_MAINTENANCE",
    },
    {
      id: "demo-vehicle-006",
      registrationNumber: "LHR-6409",
      make: "Isuzu",
      model: "NPR",
      year: 2020,
      vin: "VMMSVIN0006",
      fuelType: "Diesel",
      category: "Cargo Truck",
      currentOdometer: 87760,
      status: "IN_MAINTENANCE",
    },
    {
      id: "demo-vehicle-007",
      registrationNumber: "FSD-5310",
      make: "Suzuki",
      model: "Cultus",
      year: 2021,
      vin: "VMMSVIN0007",
      fuelType: "Petrol",
      category: "Hatchback",
      currentOdometer: 37920,
      status: "ACTIVE",
    },
    {
      id: "demo-vehicle-008",
      registrationNumber: "MUX-2240",
      make: "Toyota",
      model: "Hiace",
      year: 2022,
      vin: "VMMSVIN0008",
      fuelType: "Diesel",
      category: "Staff Van",
      currentOdometer: 59650,
      status: "ACTIVE",
    },
    {
      id: "demo-vehicle-009",
      registrationNumber: "PEW-9031",
      make: "Hyundai",
      model: "H-100",
      year: 2018,
      vin: "VMMSVIN0009",
      fuelType: "Diesel",
      category: "Mini Truck",
      currentOdometer: 112500,
      status: "OUT_OF_SERVICE",
    },
    {
      id: "demo-vehicle-010",
      registrationNumber: "BWP-4417",
      make: "Kia",
      model: "Sportage",
      year: 2023,
      vin: "VMMSVIN0010",
      fuelType: "Petrol",
      category: "SUV",
      currentOdometer: 25110,
      status: "ACTIVE",
    },
  ];

  const vehicles = {};

  for (const vehicle of vehicleRecords) {
    vehicles[vehicle.id] = await prisma.vehicle.upsert({
      where: { registrationNumber: vehicle.registrationNumber },
      update: vehicle,
      create: vehicle,
    });
  }

  return vehicles;
}

async function seedAssignments(vehicles, drivers) {
  const assignments = [
    {
      id: "demo-assignment-001",
      vehicleId: vehicles["demo-vehicle-001"].id,
      driverId: drivers.ahmed.id,
      startDate: fixedDate("2026-03-02"),
      endDate: null,
      status: "ACTIVE",
    },
    {
      id: "demo-assignment-002",
      vehicleId: vehicles["demo-vehicle-003"].id,
      driverId: drivers.bilal.id,
      startDate: fixedDate("2026-04-10"),
      endDate: null,
      status: "ACTIVE",
    },
    {
      id: "demo-assignment-003",
      vehicleId: vehicles["demo-vehicle-002"].id,
      driverId: drivers.kamran.id,
      startDate: fixedDate("2026-01-20"),
      endDate: null,
      status: "ACTIVE",
    },
    {
      id: "demo-assignment-004",
      vehicleId: vehicles["demo-vehicle-004"].id,
      driverId: drivers.hassan.id,
      startDate: fixedDate("2026-02-15"),
      endDate: null,
      status: "ACTIVE",
    },
    {
      id: "demo-assignment-005",
      vehicleId: vehicles["demo-vehicle-007"].id,
      driverId: drivers.usman.id,
      startDate: fixedDate("2026-05-04"),
      endDate: null,
      status: "ACTIVE",
    },
    {
      id: "demo-assignment-006",
      vehicleId: vehicles["demo-vehicle-005"].id,
      driverId: drivers.ahmed.id,
      startDate: fixedDate("2025-11-05"),
      endDate: fixedDate("2026-02-25"),
      status: "ENDED",
    },
    {
      id: "demo-assignment-007",
      vehicleId: vehicles["demo-vehicle-008"].id,
      driverId: drivers.bilal.id,
      startDate: fixedDate("2025-10-18"),
      endDate: fixedDate("2026-03-30"),
      status: "ENDED",
    },
  ];

  for (const assignment of assignments) {
    await prisma.vehicleAssignment.upsert({
      where: { id: assignment.id },
      update: assignment,
      create: assignment,
    });
  }
}

async function seedMaintenanceSchedules(vehicles) {
  const schedules = [
    ["demo-schedule-001", "demo-vehicle-001", "Oil and filter service", 18, 45000, "Next routine service after city operations.", "ACTIVE"],
    ["demo-schedule-002", "demo-vehicle-002", "Tyre alignment and balancing", 6, 70000, "Check front tyre wear before route season.", "ACTIVE"],
    ["demo-schedule-003", "demo-vehicle-003", "Engine tuning", -2, 51500, "Due after repeated rough idle reports.", "DUE"],
    ["demo-schedule-004", "demo-vehicle-004", "Suspension inspection", 12, 31000, "Inspect after field route deployment.", "ACTIVE"],
    ["demo-schedule-005", "demo-vehicle-005", "Differential seal replacement", -4, 92500, "Leak found during yard inspection.", "DUE"],
    ["demo-schedule-006", "demo-vehicle-006", "Clutch system inspection", 8, 88400, "Clutch pedal feels heavy under load.", "ACTIVE"],
    ["demo-schedule-007", "demo-vehicle-007", "Battery health check", 22, 39500, "Routine electrical inspection.", "ACTIVE"],
    ["demo-schedule-008", "demo-vehicle-008", "Brake pad inspection", 30, 62000, "Staff van route safety check.", "ACTIVE"],
    ["demo-schedule-009", "demo-vehicle-009", "Roadworthiness inspection", -14, 113000, "Vehicle remains parked until inspection clears.", "CANCELLED"],
    ["demo-schedule-010", "demo-vehicle-010", "Software diagnostics", -20, 25200, "Completed after warning light scan.", "COMPLETED"],
  ];

  const savedSchedules = {};

  for (const [id, vehicleKey, serviceType, dueDays, nextDueOdometer, notes, status] of schedules) {
    savedSchedules[id] = await prisma.maintenanceSchedule.upsert({
      where: { id },
      update: {
        vehicleId: vehicles[vehicleKey].id,
        serviceType,
        nextDueDate: daysFromToday(dueDays),
        nextDueOdometer,
        notes,
        status,
      },
      create: {
        id,
        vehicleId: vehicles[vehicleKey].id,
        serviceType,
        nextDueDate: daysFromToday(dueDays),
        nextDueOdometer,
        notes,
        status,
      },
    });
  }

  return savedSchedules;
}

async function seedWorkOrders(vehicles, schedules, users) {
  const techAhmedId = users.technicianAhmed.id;
  const techSaraId = users.technicianSara.id;
  const workOrders = [
    ["demo-work-order-001", "demo-vehicle-005", techAhmedId, "demo-schedule-005", "HIGH", "IN_PROGRESS", "Differential seal replacement", "Oil marks found near rear differential after delivery route.", 3, 4.5, 18000, "Seal kit installed, final road test pending."],
    ["demo-work-order-002", "demo-vehicle-002", techSaraId, "demo-schedule-002", "MEDIUM", "OPEN", "AC cooling service", "Cabin AC cooling drops during afternoon city routes.", 5, null, null, null],
    ["demo-work-order-003", "demo-vehicle-009", techAhmedId, "demo-schedule-009", "URGENT", "PENDING_PARTS", "Brake master cylinder replacement", "Brake pressure loss found during parking yard inspection.", 2, 2.0, 24500, "Waiting for master cylinder delivery."],
    ["demo-work-order-004", "demo-vehicle-001", techSaraId, "demo-schedule-001", "MEDIUM", "COMPLETED", "40k preventive service", "Routine oil, filter, and inspection service for fleet sedan.", -10, 3.5, 22000, "Service completed and vehicle released."],
    ["demo-work-order-005", "demo-vehicle-008", techAhmedId, "demo-schedule-008", "LOW", "CLOSED", "Tyre rotation", "Rotate tyres and check air pressure for staff van.", -14, 1.5, 6500, "Closed after admin review."],
    ["demo-work-order-006", "demo-vehicle-006", techSaraId, "demo-schedule-006", "HIGH", "IN_PROGRESS", "Clutch inspection", "Driver reported clutch slipping on loaded route.", 4, 2.25, 12000, "Inspection started, clutch plate estimate pending."],
    ["demo-work-order-007", "demo-vehicle-004", techAhmedId, "demo-schedule-004", "URGENT", "OPEN", "Front suspension noise", "Knocking sound reported on uneven service road.", 1, null, null, null],
    ["demo-work-order-008", "demo-vehicle-010", techSaraId, "demo-schedule-010", "LOW", "COMPLETED", "Dashboard warning scan", "Intermittent dashboard warning light during morning startup.", -4, 1.25, 5000, "Diagnostics cleared, no active faults found."],
    ["demo-work-order-009", "demo-vehicle-003", techAhmedId, "demo-schedule-003", "MEDIUM", "CLOSED", "Engine tuning", "Rough idle resolved with throttle body cleaning and tuning.", -6, 2.5, 14500, "Closed after stable test drive."],
    ["demo-work-order-010", "demo-vehicle-007", techSaraId, "demo-schedule-007", "MEDIUM", "OPEN", "Battery inspection", "Starter delay reported after overnight parking.", 9, null, null, null],
  ];

  const savedWorkOrders = {};

  for (const [id, vehicleKey, technicianId, scheduleKey, priority, status, serviceType, description, dueDays, laborHours, cost, completionNotes] of workOrders) {
    savedWorkOrders[id] = await prisma.workOrder.upsert({
      where: { id },
      update: {
        vehicleId: vehicles[vehicleKey].id,
        technicianId,
        maintenanceScheduleId: schedules[scheduleKey]?.id ?? null,
        priority,
        status,
        serviceType,
        description,
        dueDate: daysFromToday(dueDays),
        laborHours,
        cost,
        completionNotes,
      },
      create: {
        id,
        vehicleId: vehicles[vehicleKey].id,
        technicianId,
        maintenanceScheduleId: schedules[scheduleKey]?.id ?? null,
        priority,
        status,
        serviceType,
        description,
        dueDate: daysFromToday(dueDays),
        laborHours,
        cost,
        completionNotes,
      },
    });
  }

  return savedWorkOrders;
}

async function seedFuelLogs(vehicles, drivers) {
  const logs = [
    ["demo-fuel-log-001", "demo-vehicle-001", drivers.ahmed.id, -2, "Hybrid", 34.5, 286, 42150],
    ["demo-fuel-log-002", "demo-vehicle-003", drivers.bilal.id, -3, "Petrol", 38.0, 289, 51280],
    ["demo-fuel-log-003", "demo-vehicle-002", drivers.kamran.id, -5, "Petrol", 44.0, 288, 68120],
    ["demo-fuel-log-004", "demo-vehicle-004", drivers.hassan.id, -7, "Diesel", 62.0, 294, 28640],
    ["demo-fuel-log-005", "demo-vehicle-007", drivers.usman.id, -9, "Petrol", 31.0, 287, 37920],
    ["demo-fuel-log-006", "demo-vehicle-006", drivers.kamran.id, -12, "Diesel", 74.0, 293, 87760],
    ["demo-fuel-log-007", "demo-vehicle-008", drivers.bilal.id, -15, "Diesel", 68.5, 292, 59650],
    ["demo-fuel-log-008", "demo-vehicle-010", drivers.ahmed.id, -18, "Petrol", 42.0, 290, 25110],
    ["demo-fuel-log-009", "demo-vehicle-005", drivers.hassan.id, -22, "Diesel", 82.0, 294, 92430],
    ["demo-fuel-log-010", "demo-vehicle-001", drivers.ahmed.id, -28, "Hybrid", 33.0, 284, 41810],
  ];

  for (const [id, vehicleKey, driverId, dateOffset, fuelType, quantity, unitCost, odometerReading] of logs) {
    await prisma.fuelLog.upsert({
      where: { id },
      update: {
        vehicleId: vehicles[vehicleKey].id,
        driverId,
        date: daysFromToday(dateOffset),
        fuelType,
        quantity,
        unitCost,
        totalAmount: quantity * unitCost,
        odometerReading,
      },
      create: {
        id,
        vehicleId: vehicles[vehicleKey].id,
        driverId,
        date: daysFromToday(dateOffset),
        fuelType,
        quantity,
        unitCost,
        totalAmount: quantity * unitCost,
        odometerReading,
      },
    });
  }
}

async function seedComplianceDocuments(vehicles) {
  const documents = [
    ["demo-document-001", "demo-vehicle-001", "Insurance", "INS-LEA-2458", -365, 180, "insurance-lea-2458.pdf"],
    ["demo-document-002", "demo-vehicle-002", "Route Permit", "RTP-LEB-7821", -330, 18, "route-permit-leb-7821.pdf"],
    ["demo-document-003", "demo-vehicle-003", "Token Tax", "TAX-ICT-3927", -280, 90, "token-tax-ict-3927.pdf"],
    ["demo-document-004", "demo-vehicle-004", "Fitness Certificate", "FIT-RIN-1184", -360, 24, "fitness-rin-1184.pdf"],
    ["demo-document-005", "demo-vehicle-005", "Insurance", "INS-KHI-7712", -400, -6, "insurance-khi-7712.pdf"],
    ["demo-document-006", "demo-vehicle-006", "Route Permit", "RTP-LHR-6409", -250, 12, "route-permit-lhr-6409.pdf"],
    ["demo-document-007", "demo-vehicle-007", "Registration Book", "REG-FSD-5310", -900, 365, "registration-fsd-5310.pdf"],
    ["demo-document-008", "demo-vehicle-008", "Fitness Certificate", "FIT-MUX-2240", -300, 45, "fitness-mux-2240.pdf"],
    ["demo-document-009", "demo-vehicle-009", "Emissions Certificate", "EMI-PEW-9031", -390, -20, "emissions-pew-9031.pdf"],
    ["demo-document-010", "demo-vehicle-010", "Insurance", "INS-BWP-4417", -120, 270, "insurance-bwp-4417.pdf"],
  ];

  for (const [id, vehicleKey, documentType, documentNumber, issueOffset, expiryOffset, filePath] of documents) {
    const expiryDate = daysFromToday(expiryOffset);

    await prisma.complianceDocument.upsert({
      where: { id },
      update: {
        vehicleId: vehicles[vehicleKey].id,
        documentType,
        documentNumber,
        issueDate: daysFromToday(issueOffset),
        expiryDate,
        filePath,
        status: getComplianceStatus(expiryDate),
      },
      create: {
        id,
        vehicleId: vehicles[vehicleKey].id,
        documentType,
        documentNumber,
        issueDate: daysFromToday(issueOffset),
        expiryDate,
        filePath,
        status: getComplianceStatus(expiryDate),
      },
    });
  }
}

async function seedFaultReports(vehicles, drivers, users, workOrders) {
  const reports = [
    ["demo-fault-report-001", "demo-vehicle-004", drivers.ahmed.id, users.driverAhmed.id, "HIGH", "CONVERTED_TO_WORK_ORDER", "Front suspension makes knocking sound on uneven roads.", workOrders["demo-work-order-007"].id],
    ["demo-fault-report-002", "demo-vehicle-001", drivers.ahmed.id, users.driverAhmed.id, "LOW", "REVIEWED", "Wiper blades leave streaks during light rain.", null],
    ["demo-fault-report-003", "demo-vehicle-003", drivers.bilal.id, users.driverBilal.id, "MEDIUM", "CLOSED", "Engine idle felt rough during morning startup.", null],
    ["demo-fault-report-004", "demo-vehicle-002", drivers.bilal.id, users.driverBilal.id, "MEDIUM", "CONVERTED_TO_WORK_ORDER", "Cabin AC cooling reduced during afternoon route.", workOrders["demo-work-order-002"].id],
    ["demo-fault-report-005", "demo-vehicle-001", drivers.ahmed.id, users.driverAhmed.id, "LOW", "NEW", "Interior cabin light flickers near passenger side.", null],
    ["demo-fault-report-006", "demo-vehicle-003", drivers.bilal.id, users.driverBilal.id, "HIGH", "NEW", "Brake pedal feels softer than usual after long route.", null],
    ["demo-fault-report-007", "demo-vehicle-008", drivers.bilal.id, users.driverBilal.id, "LOW", "REVIEWED", "Sliding door handle feels loose.", null],
    ["demo-fault-report-008", "demo-vehicle-010", drivers.ahmed.id, users.driverAhmed.id, "MEDIUM", "CLOSED", "Dashboard warning appeared once and then disappeared.", null],
    ["demo-fault-report-009", "demo-vehicle-005", drivers.ahmed.id, users.driverAhmed.id, "HIGH", "REVIEWED", "Oil smell noticed after parking in yard.", null],
    ["demo-fault-report-010", "demo-vehicle-006", drivers.bilal.id, users.driverBilal.id, "MEDIUM", "NEW", "Clutch pedal feels heavier under load.", null],
  ];

  for (const [id, vehicleKey, driverId, reporterId, urgency, status, description, workOrderId] of reports) {
    await prisma.faultReport.upsert({
      where: { id },
      update: {
        vehicleId: vehicles[vehicleKey].id,
        driverId,
        reporterId,
        urgency,
        description,
        status,
        workOrderId,
        photoPath: null,
      },
      create: {
        id,
        vehicleId: vehicles[vehicleKey].id,
        driverId,
        reporterId,
        urgency,
        description,
        status,
        workOrderId,
        photoPath: null,
      },
    });
  }
}

async function main() {
  const roleMap = await seedRoles();
  const users = await seedUsers(roleMap);
  const drivers = await seedDrivers(users);
  const vehicles = await seedVehicles();

  await seedAssignments(vehicles, drivers);
  const schedules = await seedMaintenanceSchedules(vehicles);
  const workOrders = await seedWorkOrders(vehicles, schedules, users);

  await seedFuelLogs(vehicles, drivers);
  await seedComplianceDocuments(vehicles);
  await seedFaultReports(vehicles, drivers, users, workOrders);

  console.log("VMMS demo data seeded successfully.");
  console.log("Added demo accounts:");
  console.log("Technician: sara.technician@vmms.local / Tech@12345");
  console.log("Driver: bilal.driver@vmms.local / Driver@12345");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
