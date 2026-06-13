const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");
const { getScheduleStatus } = require("../utils/maintenanceStatus");
const { createWorkOrder } = require("./workOrderService");

const maintenanceScheduleInclude = {
  vehicle: {
    select: {
      id: true,
      registrationNumber: true,
      make: true,
      model: true,
      currentOdometer: true,
      status: true,
    },
  },
  workOrders: {
    orderBy: { createdAt: "desc" },
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
          status: true,
        },
      },
    },
    take: 3,
  },
  _count: {
    select: {
      workOrders: true,
    },
  },
};

function buildScheduleWhere(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.dueOnly) {
    where.status = "DUE";
    return where;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return where;
}

async function validateVehicle(vehicleId) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  if (vehicle.status === "OUT_OF_SERVICE") {
    throw createHttpError(400, "Out of service vehicles cannot receive new maintenance schedules");
  }

  return vehicle;
}

async function refreshScheduleStatuses() {
  const schedules = await prisma.maintenanceSchedule.findMany({
    where: {
      status: {
        in: ["ACTIVE", "DUE"],
      },
    },
    include: {
      vehicle: true,
    },
  });

  const updates = schedules
    .map((schedule) => ({
      currentStatus: schedule.status,
      id: schedule.id,
      nextStatus: getScheduleStatus(schedule, schedule.vehicle),
    }))
    .filter((schedule) => schedule.currentStatus !== schedule.nextStatus);

  await Promise.all(
    updates.map((schedule) =>
      prisma.maintenanceSchedule.update({
        where: { id: schedule.id },
        data: { status: schedule.nextStatus },
      }),
    ),
  );
}

async function findSchedules(filters) {
  await refreshScheduleStatuses();

  return prisma.maintenanceSchedule.findMany({
    where: buildScheduleWhere(filters),
    orderBy: [{ status: "asc" }, { nextDueDate: "asc" }, { createdAt: "desc" }],
    include: maintenanceScheduleInclude,
  });
}

async function findScheduleById(id) {
  return prisma.maintenanceSchedule.findUnique({
    where: { id },
    include: maintenanceScheduleInclude,
  });
}

async function createSchedule(data) {
  const vehicle = await validateVehicle(data.vehicleId);

  const schedule = await prisma.maintenanceSchedule.create({
    data: {
      ...data,
      status: getScheduleStatus(data, vehicle),
    },
  });

  return findScheduleById(schedule.id);
}

async function updateSchedule(id, data) {
  const schedule = await findScheduleById(id);

  if (!schedule) {
    throw createHttpError(404, "Maintenance schedule not found");
  }

  const vehicle = await validateVehicle(data.vehicleId);

  await prisma.maintenanceSchedule.update({
    where: { id },
    data: {
      ...data,
      status: getScheduleStatus(data, vehicle),
    },
  });

  return findScheduleById(id);
}

async function deleteSchedule(id) {
  const schedule = await findScheduleById(id);

  if (!schedule) {
    throw createHttpError(404, "Maintenance schedule not found");
  }

  if (schedule._count.workOrders > 0) {
    const cancelledSchedule = await prisma.maintenanceSchedule.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: maintenanceScheduleInclude,
    });

    return {
      action: "cancelled",
      schedule: cancelledSchedule,
    };
  }

  await prisma.maintenanceSchedule.delete({
    where: { id },
  });

  return {
    action: "deleted",
    schedule: null,
  };
}

async function createWorkOrderFromSchedule(id, payload) {
  const schedule = await findScheduleById(id);

  if (!schedule) {
    throw createHttpError(404, "Maintenance schedule not found");
  }

  if (schedule.status === "CANCELLED") {
    throw createHttpError(409, "Cancelled schedules cannot be converted to work orders");
  }

  if (schedule.status === "COMPLETED") {
    throw createHttpError(409, "Completed schedules have already been converted or closed");
  }

  const workOrder = await createWorkOrder({
    completionNotes: null,
    cost: null,
    description: payload.description,
    dueDate: payload.dueDate,
    laborHours: null,
    maintenanceScheduleId: schedule.id,
    priority: payload.priority,
    serviceType: schedule.serviceType,
    status: "OPEN",
    technicianId: payload.technicianId,
    vehicleId: schedule.vehicleId,
  });

  await prisma.maintenanceSchedule.update({
    where: { id },
    data: { status: "COMPLETED" },
  });

  return {
    schedule: await findScheduleById(id),
    workOrder,
  };
}

module.exports = {
  createSchedule,
  createWorkOrderFromSchedule,
  deleteSchedule,
  findScheduleById,
  findSchedules,
  refreshScheduleStatuses,
  updateSchedule,
};
