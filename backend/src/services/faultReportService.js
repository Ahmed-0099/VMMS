const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");
const { createWorkOrder } = require("./workOrderService");

const faultReportInclude = {
  driver: {
    select: {
      id: true,
      fullName: true,
      licenseNumber: true,
      phone: true,
      userId: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
  reporter: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  vehicle: {
    select: {
      id: true,
      registrationNumber: true,
      make: true,
      model: true,
      status: true,
      currentOdometer: true,
    },
  },
  workOrder: {
    select: {
      id: true,
      priority: true,
      serviceType: true,
      status: true,
      technician: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  },
};

function buildFaultReportWhere(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.urgency) {
    where.urgency = filters.urgency;
  }

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.driverId) {
    where.driverId = filters.driverId;
  }

  if (filters.reporterId) {
    where.reporterId = filters.reporterId;
  }

  return where;
}

async function findFaultReports(filters) {
  return prisma.faultReport.findMany({
    where: buildFaultReportWhere(filters),
    orderBy: [{ status: "asc" }, { urgency: "desc" }, { createdAt: "desc" }],
    include: faultReportInclude,
  });
}

async function findFaultReportById(id) {
  return prisma.faultReport.findUnique({
    where: { id },
    include: faultReportInclude,
  });
}

async function validateVehicle(vehicleId) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  if (vehicle.status === "OUT_OF_SERVICE") {
    throw createHttpError(400, "Out of service vehicles cannot receive new fault reports");
  }

  return vehicle;
}

async function resolveDriverContext(userId) {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: {
      assignments: {
        where: { status: "ACTIVE" },
        take: 1,
        include: {
          vehicle: true,
        },
      },
    },
  });

  if (!driver) {
    throw createHttpError(403, "No driver profile is linked to this account");
  }

  const activeAssignment = driver.assignments[0] ?? null;

  if (!activeAssignment) {
    throw createHttpError(400, "You need an active vehicle assignment before submitting fault reports");
  }

  return {
    activeAssignment,
    driver,
  };
}

async function createFaultReport(data) {
  await validateVehicle(data.vehicleId);

  const report = await prisma.faultReport.create({
    data: {
      description: data.description,
      driverId: data.driverId,
      photoPath: data.photoPath,
      reporterId: data.reporterId,
      status: "NEW",
      urgency: data.urgency,
      vehicleId: data.vehicleId,
    },
  });

  return findFaultReportById(report.id);
}

async function updateFaultReportStatus(id, status) {
  const report = await findFaultReportById(id);

  if (!report) {
    throw createHttpError(404, "Fault report not found");
  }

  if (!["REVIEWED", "CLOSED"].includes(status)) {
    throw createHttpError(400, "Fault report can only be marked reviewed or closed from this action");
  }

  if (report.status === "CONVERTED_TO_WORK_ORDER") {
    throw createHttpError(409, "Converted fault reports cannot be changed manually");
  }

  if (report.status === status) {
    return report;
  }

  await prisma.faultReport.update({
    where: { id },
    data: { status },
  });

  return findFaultReportById(id);
}

async function convertToWorkOrder(id, workOrderData) {
  const report = await findFaultReportById(id);

  if (!report) {
    throw createHttpError(404, "Fault report not found");
  }

  if (report.status === "CLOSED") {
    throw createHttpError(409, "Closed fault reports cannot be converted to work orders");
  }

  if (report.workOrderId || report.status === "CONVERTED_TO_WORK_ORDER") {
    throw createHttpError(409, "Fault report has already been converted to a work order");
  }

  const workOrder = await createWorkOrder({
    completionNotes: null,
    cost: null,
    description: workOrderData.description,
    dueDate: workOrderData.dueDate,
    laborHours: null,
    maintenanceScheduleId: null,
    priority: workOrderData.priority,
    serviceType: workOrderData.serviceType,
    status: "OPEN",
    technicianId: workOrderData.technicianId,
    vehicleId: report.vehicleId,
  });

  await prisma.faultReport.update({
    where: { id },
    data: {
      status: "CONVERTED_TO_WORK_ORDER",
      workOrderId: workOrder.id,
    },
  });

  return {
    faultReport: await findFaultReportById(id),
    workOrder,
  };
}

module.exports = {
  convertToWorkOrder,
  createFaultReport,
  findFaultReportById,
  findFaultReports,
  resolveDriverContext,
  updateFaultReportStatus,
};
