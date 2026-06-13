const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");

function buildDriverWhere(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { fullName: { contains: filters.search, mode: "insensitive" } },
      { cnic: { contains: filters.search, mode: "insensitive" } },
      { licenseNumber: { contains: filters.search, mode: "insensitive" } },
      { phone: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  return where;
}

const driverInclude = {
  user: {
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      role: {
        select: {
          name: true,
        },
      },
    },
  },
  assignments: {
    orderBy: { startDate: "desc" },
    take: 1,
    include: {
      vehicle: true,
    },
  },
  _count: {
    select: {
      assignments: true,
      faultReports: true,
      fuelLogs: true,
    },
  },
};

async function findDrivers(filters) {
  return prisma.driver.findMany({
    where: buildDriverWhere(filters),
    orderBy: [{ createdAt: "desc" }, { fullName: "asc" }],
    include: driverInclude,
  });
}

async function findDriverById(id) {
  return prisma.driver.findUnique({
    where: { id },
    include: driverInclude,
  });
}

async function findDriverByUserId(userId) {
  return prisma.driver.findUnique({
    where: { userId },
    include: driverInclude,
  });
}

async function findDriverUsers() {
  return prisma.user.findMany({
    where: {
      role: {
        name: "DRIVER",
      },
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
      driverProfile: {
        select: {
          id: true,
          fullName: true,
          licenseNumber: true,
        },
      },
    },
  });
}

async function validateDriverUserLink(userId, ignoredDriverId) {
  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true },
  });

  if (!user) {
    throw createHttpError(400, "Linked user does not exist");
  }

  if (user.role.name !== "DRIVER") {
    throw createHttpError(400, "Linked user must have the DRIVER role");
  }

  const existingDriver = await prisma.driver.findFirst({
    where: {
      userId,
      ...(ignoredDriverId ? { NOT: { id: ignoredDriverId } } : {}),
    },
  });

  if (existingDriver) {
    throw createHttpError(409, "Linked user already has a driver profile");
  }

  return user;
}

async function ensureDriverDoesNotConflict(data, ignoredDriverId) {
  const duplicateLicense = await prisma.driver.findFirst({
    where: {
      licenseNumber: data.licenseNumber,
      ...(ignoredDriverId ? { NOT: { id: ignoredDriverId } } : {}),
    },
  });

  if (duplicateLicense) {
    throw createHttpError(409, "Driver license number already exists");
  }

  if (data.cnic) {
    const duplicateCnic = await prisma.driver.findFirst({
      where: {
        cnic: data.cnic,
        ...(ignoredDriverId ? { NOT: { id: ignoredDriverId } } : {}),
      },
    });

    if (duplicateCnic) {
      throw createHttpError(409, "Driver CNIC already exists");
    }
  }

  await validateDriverUserLink(data.userId, ignoredDriverId);
}

async function createDriver(data) {
  await ensureDriverDoesNotConflict(data);

  const driver = await prisma.driver.create({
    data,
  });

  return findDriverById(driver.id);
}

async function updateDriver(id, data) {
  const driver = await findDriverById(id);

  if (!driver) {
    throw createHttpError(404, "Driver not found");
  }

  await ensureDriverDoesNotConflict(data, id);

  await prisma.driver.update({
    where: { id },
    data,
  });

  return findDriverById(id);
}

async function deleteDriver(id) {
  const driver = await findDriverById(id);

  if (!driver) {
    throw createHttpError(404, "Driver not found");
  }

  const activeAssignmentCount = await prisma.vehicleAssignment.count({
    where: {
      driverId: id,
      status: "ACTIVE",
    },
  });

  const relatedRecordCount = driver._count.assignments + driver._count.faultReports + driver._count.fuelLogs;

  if (activeAssignmentCount > 0 || relatedRecordCount > 0) {
    const inactiveDriver = await prisma.driver.update({
      where: { id },
      data: { status: "INACTIVE" },
      include: driverInclude,
    });

    return {
      action: "deactivated",
      driver: inactiveDriver,
    };
  }

  await prisma.driver.delete({
    where: { id },
  });

  return {
    action: "deleted",
    driver: null,
  };
}

module.exports = {
  createDriver,
  deleteDriver,
  findDriverById,
  findDriverByUserId,
  findDriverUsers,
  findDrivers,
  updateDriver,
};
