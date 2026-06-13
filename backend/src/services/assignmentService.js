const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");

const assignmentInclude = {
  vehicle: {
    select: {
      id: true,
      registrationNumber: true,
      make: true,
      model: true,
      fuelType: true,
      status: true,
      currentOdometer: true,
    },
  },
  driver: {
    select: {
      id: true,
      fullName: true,
      licenseNumber: true,
      phone: true,
      status: true,
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
};

function buildAssignmentWhere(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.driverId) {
    where.driverId = filters.driverId;
  }

  return where;
}

async function findAssignments(filters) {
  return prisma.vehicleAssignment.findMany({
    where: buildAssignmentWhere(filters),
    orderBy: [{ status: "asc" }, { startDate: "desc" }, { createdAt: "desc" }],
    include: assignmentInclude,
  });
}

async function getActiveAssignmentForVehicle(vehicleId) {
  return prisma.vehicleAssignment.findFirst({
    where: {
      vehicleId,
      status: "ACTIVE",
    },
    include: assignmentInclude,
  });
}

async function getActiveAssignmentForDriver(driverId) {
  return prisma.vehicleAssignment.findFirst({
    where: {
      driverId,
      status: "ACTIVE",
    },
    include: assignmentInclude,
  });
}

async function ensureAssignmentCanBeCreated(data) {
  const [vehicle, driver] = await Promise.all([
    prisma.vehicle.findUnique({ where: { id: data.vehicleId } }),
    prisma.driver.findUnique({ where: { id: data.driverId } }),
  ]);

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  if (!driver) {
    throw createHttpError(404, "Driver not found");
  }

  if (vehicle.status !== "ACTIVE") {
    throw createHttpError(400, "Only active vehicles can be assigned");
  }

  if (driver.status !== "ACTIVE") {
    throw createHttpError(400, "Only active drivers can be assigned");
  }

  const [activeVehicleAssignment, activeDriverAssignment] = await Promise.all([
    getActiveAssignmentForVehicle(data.vehicleId),
    getActiveAssignmentForDriver(data.driverId),
  ]);

  if (activeVehicleAssignment) {
    throw createHttpError(409, "Vehicle already has an active assignment");
  }

  if (activeDriverAssignment) {
    throw createHttpError(409, "Driver already has an active assignment");
  }
}

async function createAssignment(data) {
  await ensureAssignmentCanBeCreated(data);

  const assignment = await prisma.vehicleAssignment.create({
    data: {
      vehicleId: data.vehicleId,
      driverId: data.driverId,
      startDate: data.startDate,
      status: "ACTIVE",
    },
  });

  return prisma.vehicleAssignment.findUnique({
    where: { id: assignment.id },
    include: assignmentInclude,
  });
}

async function endAssignment(id, endDate) {
  const assignment = await prisma.vehicleAssignment.findUnique({
    where: { id },
    include: assignmentInclude,
  });

  if (!assignment) {
    throw createHttpError(404, "Assignment not found");
  }

  if (assignment.status === "ENDED") {
    throw createHttpError(409, "Assignment is already ended");
  }

  if (endDate.getTime() < assignment.startDate.getTime()) {
    throw createHttpError(400, "End date cannot be before the start date");
  }

  return prisma.vehicleAssignment.update({
    where: { id },
    data: {
      endDate,
      status: "ENDED",
    },
    include: assignmentInclude,
  });
}

async function getActiveAssignmentForLoggedInDriver(userId) {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!driver) {
    return null;
  }

  return getActiveAssignmentForDriver(driver.id);
}

module.exports = {
  createAssignment,
  endAssignment,
  findAssignments,
  getActiveAssignmentForLoggedInDriver,
  getActiveAssignmentForVehicle,
};
