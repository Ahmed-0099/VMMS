const prisma = require("../config/prisma");
const { createHttpError } = require("../utils/httpError");
const { canTransitionWorkOrderStatus } = require("../utils/workOrderStatus");

const maintenanceWorkOrderStatuses = ["IN_PROGRESS", "PENDING_PARTS", "COMPLETED"];

const workOrderInclude = {
  vehicle: {
    select: {
      id: true,
      registrationNumber: true,
      make: true,
      model: true,
      status: true,
    },
  },
  technician: {
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
  maintenanceSchedule: {
    select: {
      id: true,
      serviceType: true,
      status: true,
    },
  },
};

function buildWorkOrderWhere(filters = {}) {
  const where = {};

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.technicianId) {
    where.technicianId = filters.technicianId;
  }

  return where;
}

async function findWorkOrders(filters) {
  return prisma.workOrder.findMany({
    where: buildWorkOrderWhere(filters),
    orderBy: [{ status: "asc" }, { priority: "desc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    include: workOrderInclude,
  });
}

async function findWorkOrderById(id) {
  return prisma.workOrder.findUnique({
    where: { id },
    include: workOrderInclude,
  });
}

async function findTechnicians() {
  return prisma.user.findMany({
    where: {
      role: {
        name: "TECHNICIAN",
      },
    },
    orderBy: [{ name: "asc" }, { email: "asc" }],
    select: {
      id: true,
      name: true,
      email: true,
      status: true,
    },
  });
}

function assertTechnicianCanAccess(workOrder, userId) {
  if (!workOrder || workOrder.technicianId !== userId) {
    throw createHttpError(403, "You do not have permission to access this work order");
  }
}

async function validateTechnician(technicianId) {
  if (!technicianId) {
    return null;
  }

  const technician = await prisma.user.findUnique({
    where: { id: technicianId },
    include: { role: true },
  });

  if (!technician) {
    throw createHttpError(404, "Technician not found");
  }

  if (technician.role.name !== "TECHNICIAN") {
    throw createHttpError(400, "Assigned user must have the TECHNICIAN role");
  }

  if (technician.status !== "ACTIVE") {
    throw createHttpError(400, "Assigned technician must be active");
  }

  return technician;
}

async function validateVehicle(vehicleId) {
  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
  });

  if (!vehicle) {
    throw createHttpError(404, "Vehicle not found");
  }

  if (vehicle.status === "OUT_OF_SERVICE") {
    throw createHttpError(400, "Out of service vehicles cannot receive new work orders");
  }

  return vehicle;
}

async function validateMaintenanceSchedule(maintenanceScheduleId, vehicleId) {
  if (!maintenanceScheduleId) {
    return null;
  }

  const schedule = await prisma.maintenanceSchedule.findUnique({
    where: { id: maintenanceScheduleId },
  });

  if (!schedule) {
    throw createHttpError(404, "Maintenance schedule not found");
  }

  if (schedule.vehicleId !== vehicleId) {
    throw createHttpError(400, "Maintenance schedule must belong to the selected vehicle");
  }

  return schedule;
}

async function syncVehicleStatusForWorkOrder(vehicleId) {
  const maintenanceCount = await prisma.workOrder.count({
    where: {
      vehicleId,
      status: {
        in: maintenanceWorkOrderStatuses,
      },
    },
  });

  const vehicle = await prisma.vehicle.findUnique({
    where: { id: vehicleId },
    select: { status: true },
  });

  if (!vehicle || vehicle.status === "OUT_OF_SERVICE") {
    return;
  }

  if (maintenanceCount > 0 && vehicle.status !== "IN_MAINTENANCE") {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "IN_MAINTENANCE" },
    });
    return;
  }

  if (maintenanceCount === 0 && vehicle.status === "IN_MAINTENANCE") {
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: "ACTIVE" },
    });
  }
}

async function createWorkOrder(data) {
  await validateVehicle(data.vehicleId);
  await validateTechnician(data.technicianId);
  await validateMaintenanceSchedule(data.maintenanceScheduleId, data.vehicleId);

  const workOrder = await prisma.workOrder.create({
    data,
  });

  await syncVehicleStatusForWorkOrder(workOrder.vehicleId);

  return findWorkOrderById(workOrder.id);
}

async function updateWorkOrder(id, data) {
  const workOrder = await findWorkOrderById(id);

  if (!workOrder) {
    throw createHttpError(404, "Work order not found");
  }

  await validateVehicle(data.vehicleId);
  await validateTechnician(data.technicianId);
  await validateMaintenanceSchedule(data.maintenanceScheduleId, data.vehicleId);

  if (workOrder.status !== data.status && !canTransitionWorkOrderStatus(workOrder.status, data.status)) {
    throw createHttpError(400, `Cannot move work order from ${workOrder.status} to ${data.status}`);
  }

  const updatedWorkOrder = await prisma.workOrder.update({
    where: { id },
    data,
  });

  await Promise.all([
    syncVehicleStatusForWorkOrder(workOrder.vehicleId),
    workOrder.vehicleId === updatedWorkOrder.vehicleId ? Promise.resolve() : syncVehicleStatusForWorkOrder(updatedWorkOrder.vehicleId),
  ]);

  return findWorkOrderById(id);
}

async function updateWorkOrderProgress(id, data, userId) {
  const workOrder = await findWorkOrderById(id);

  if (!workOrder) {
    throw createHttpError(404, "Work order not found");
  }

  assertTechnicianCanAccess(workOrder, userId);

  await prisma.workOrder.update({
    where: { id },
    data,
  });

  return findWorkOrderById(id);
}

async function updateWorkOrderStatus(id, nextStatus, actor) {
  const workOrder = await findWorkOrderById(id);

  if (!workOrder) {
    throw createHttpError(404, "Work order not found");
  }

  if (actor.role === "TECHNICIAN") {
    assertTechnicianCanAccess(workOrder, actor.userId);

    if (nextStatus === "CLOSED") {
      throw createHttpError(403, "Only Admin users can close completed work orders");
    }
  }

  if (workOrder.status === nextStatus) {
    return workOrder;
  }

  if (!canTransitionWorkOrderStatus(workOrder.status, nextStatus)) {
    throw createHttpError(400, `Cannot move work order from ${workOrder.status} to ${nextStatus}`);
  }

  const updatedWorkOrder = await prisma.workOrder.update({
    where: { id },
    data: {
      status: nextStatus,
    },
  });

  await syncVehicleStatusForWorkOrder(updatedWorkOrder.vehicleId);

  return findWorkOrderById(id);
}

async function deleteWorkOrder(id) {
  const workOrder = await findWorkOrderById(id);

  if (!workOrder) {
    throw createHttpError(404, "Work order not found");
  }

  await prisma.workOrder.delete({
    where: { id },
  });

  await syncVehicleStatusForWorkOrder(workOrder.vehicleId);
}

module.exports = {
  createWorkOrder,
  deleteWorkOrder,
  findTechnicians,
  findWorkOrderById,
  findWorkOrders,
  updateWorkOrder,
  updateWorkOrderProgress,
  updateWorkOrderStatus,
};
