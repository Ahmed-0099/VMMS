const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");

function buildVehicleWhere(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.fuelType) {
    where.fuelType = {
      contains: filters.fuelType,
      mode: "insensitive",
    };
  }

  if (filters.category) {
    where.category = {
      contains: filters.category,
      mode: "insensitive",
    };
  }

  if (filters.search) {
    where.OR = [
      { registrationNumber: { contains: filters.search, mode: "insensitive" } },
      { make: { contains: filters.search, mode: "insensitive" } },
      { model: { contains: filters.search, mode: "insensitive" } },
      { vin: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

async function findVehicles(filters) {
  return prisma.vehicle.findMany({
    where: buildVehicleWhere(filters),
    orderBy: [{ createdAt: "desc" }, { registrationNumber: "asc" }],
    include: {
      _count: {
        select: {
          assignments: true,
          workOrders: true,
          fuelLogs: true,
          complianceDocuments: true,
        },
      },
    },
  });
}

async function findVehicleById(id) {
  return prisma.vehicle.findUnique({
    where: { id },
    include: {
      assignments: {
        orderBy: { startDate: "desc" },
        take: 1,
        include: {
          driver: true,
        },
      },
      _count: {
        select: {
          assignments: true,
          maintenanceSchedules: true,
          workOrders: true,
          faultReports: true,
          fuelLogs: true,
          complianceDocuments: true,
        },
      },
    },
  });
}

async function ensureVehicleDoesNotConflict(data, ignoredVehicleId) {
  const duplicateRegistration = await prisma.vehicle.findFirst({
    where: {
      registrationNumber: data.registrationNumber,
      ...(ignoredVehicleId ? { NOT: { id: ignoredVehicleId } } : {}),
    },
  });

  if (duplicateRegistration) {
    throw createHttpError(409, "Vehicle registration number already exists");
  }

  if (data.vin) {
    const duplicateVin = await prisma.vehicle.findFirst({
      where: {
        vin: data.vin,
        ...(ignoredVehicleId ? { NOT: { id: ignoredVehicleId } } : {}),
      },
    });

    if (duplicateVin) {
      throw createHttpError(409, "Vehicle VIN or chassis number already exists");
    }
  }
}

async function createVehicle(data) {
  await ensureVehicleDoesNotConflict(data);

  return prisma.vehicle.create({
    data,
  });
}

async function updateVehicle(id, data) {
  const vehicle = await findVehicleById(id);

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  await ensureVehicleDoesNotConflict(data, id);

  await prisma.vehicle.update({
    where: { id },
    data,
  });

  return findVehicleById(id);
}

async function deleteVehicle(id) {
  const vehicle = await findVehicleById(id);

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  const relatedRecordCount =
    vehicle._count.assignments +
    vehicle._count.maintenanceSchedules +
    vehicle._count.workOrders +
    vehicle._count.faultReports +
    vehicle._count.fuelLogs +
    vehicle._count.complianceDocuments;

  if (relatedRecordCount > 0) {
    throw createHttpError(409, "Vehicle has related records. Change its status instead of deleting it.");
  }

  await prisma.vehicle.delete({
    where: { id },
  });
}

module.exports = {
  createVehicle,
  deleteVehicle,
  findVehicleById,
  findVehicles,
  updateVehicle,
};
