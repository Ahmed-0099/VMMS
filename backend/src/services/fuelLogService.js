const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");

const fuelLogInclude = {
  vehicle: {
    select: {
      id: true,
      registrationNumber: true,
      make: true,
      model: true,
      fuelType: true,
      currentOdometer: true,
      status: true,
    },
  },
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
};

function buildFuelLogWhere(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.driverId) {
    where.driverId = filters.driverId;
  }

  if (filters.from || filters.to) {
    where.date = {};

    if (filters.from) {
      where.date.gte = filters.from;
    }

    if (filters.to) {
      where.date.lte = filters.to;
    }
  }

  return where;
}

function calculateTotalAmount(quantity, unitCost) {
  return Math.round(quantity * unitCost * 100) / 100;
}

async function findFuelLogs(filters) {
  return prisma.fuelLog.findMany({
    where: buildFuelLogWhere(filters),
    orderBy: [{ date: "desc" }, { createdAt: "desc" }],
    include: fuelLogInclude,
  });
}

async function findFuelLogById(id) {
  return prisma.fuelLog.findUnique({
    where: { id },
    include: fuelLogInclude,
  });
}

async function findDriverFuelContext(userId) {
  const driver = await prisma.driver.findUnique({
    where: { userId },
    include: {
      assignments: {
        where: { status: "ACTIVE" },
        take: 1,
        include: {
          vehicle: {
            select: {
              id: true,
              registrationNumber: true,
              make: true,
              model: true,
              fuelType: true,
              currentOdometer: true,
              status: true,
            },
          },
        },
      },
    },
  });

  if (!driver) {
    throw createHttpError(403, "No driver profile is linked to this account");
  }

  return {
    activeAssignment: driver.assignments[0] ?? null,
    driver,
  };
}

async function validateVehicle(vehicleId) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  return vehicle;
}

async function validateDriver(driverId) {
  if (!driverId) {
    return null;
  }

  const driver = await prisma.driver.findUnique({
    where: { id: driverId },
  });

  if (!driver) {
    throw createHttpError(404, "Driver not found");
  }

  if (driver.status !== "ACTIVE") {
    throw createHttpError(400, "Selected driver must be active");
  }

  return driver;
}

async function validateFuelLogRelations(data) {
  await Promise.all([validateVehicle(data.vehicleId), validateDriver(data.driverId)]);
}

async function createFuelLog(data) {
  await validateFuelLogRelations(data);

  const fuelLog = await prisma.fuelLog.create({
    data: {
      ...data,
      totalAmount: calculateTotalAmount(data.quantity, data.unitCost),
    },
  });

  return findFuelLogById(fuelLog.id);
}

async function updateFuelLog(id, data) {
  const fuelLog = await findFuelLogById(id);

  if (!fuelLog) {
    throw createHttpError(404, "Fuel log not found");
  }

  await validateFuelLogRelations(data);

  await prisma.fuelLog.update({
    where: { id },
    data: {
      ...data,
      totalAmount: calculateTotalAmount(data.quantity, data.unitCost),
    },
  });

  return findFuelLogById(id);
}

async function deleteFuelLog(id) {
  const fuelLog = await findFuelLogById(id);

  if (!fuelLog) {
    throw createHttpError(404, "Fuel log not found");
  }

  await prisma.fuelLog.delete({
    where: { id },
  });
}

async function getFuelSummary(filters) {
  const where = buildFuelLogWhere(filters);
  const [count, totals] = await Promise.all([
    prisma.fuelLog.count({ where }),
    prisma.fuelLog.aggregate({
      _avg: { unitCost: true },
      _sum: {
        quantity: true,
        totalAmount: true,
      },
      where,
    }),
  ]);

  return {
    averageUnitCost: totals._avg.unitCost ?? 0,
    count,
    totalAmount: totals._sum.totalAmount ?? 0,
    totalQuantity: totals._sum.quantity ?? 0,
  };
}

module.exports = {
  createFuelLog,
  deleteFuelLog,
  findDriverFuelContext,
  findFuelLogById,
  findFuelLogs,
  getFuelSummary,
  updateFuelLog,
};
