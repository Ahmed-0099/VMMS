const prisma = require("../config/prisma");
const { getScheduleStatus } = require("../utils/maintenanceStatus");

const OPEN_WORK_ORDER_STATUSES = ["OPEN", "IN_PROGRESS", "PENDING_PARTS"];
const COMPLETED_WORK_ORDER_STATUSES = ["COMPLETED", "CLOSED"];
const ATTENTION_DOCUMENT_STATUSES = ["EXPIRING_SOON", "EXPIRED"];
const ACTIVE_MAINTENANCE_STATUSES = ["ACTIVE", "DUE"];

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getCurrentMonthRange(referenceDate = new Date()) {
  const monthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), 1);
  const nextMonthStart = new Date(referenceDate.getFullYear(), referenceDate.getMonth() + 1, 1);

  return { monthStart, nextMonthStart };
}

async function getAdminDashboardSummary() {
  const today = new Date();
  const { monthStart, nextMonthStart } = getCurrentMonthRange(today);
  const documentAttentionDate = addDays(today, 30);
  const maintenanceAttentionDate = addDays(today, 14);

  const [
    totalVehicles,
    activeVehicles,
    vehiclesInMaintenance,
    totalDrivers,
    openWorkOrders,
    completedWorkOrders,
    fuelCostResult,
    expiringDocuments,
    newFaultReports,
    maintenanceScheduleAttentionList,
  ] = await Promise.all([
    prisma.vehicle.count(),
    prisma.vehicle.count({ where: { status: "ACTIVE" } }),
    prisma.vehicle.count({ where: { status: "IN_MAINTENANCE" } }),
    prisma.driver.count(),
    prisma.workOrder.count({ where: { status: { in: OPEN_WORK_ORDER_STATUSES } } }),
    prisma.workOrder.count({ where: { status: { in: COMPLETED_WORK_ORDER_STATUSES } } }),
    prisma.fuelLog.aggregate({
      _sum: { totalAmount: true },
      where: {
        date: {
          gte: monthStart,
          lt: nextMonthStart,
        },
      },
    }),
    prisma.complianceDocument.count({
      where: {
        OR: [
          { status: { in: ATTENTION_DOCUMENT_STATUSES } },
          { expiryDate: { lte: documentAttentionDate } },
        ],
      },
    }),
    prisma.faultReport.count({ where: { status: "NEW" } }),
    prisma.maintenanceSchedule.findMany({
      where: {
        status: { in: ACTIVE_MAINTENANCE_STATUSES },
      },
      include: {
        vehicle: {
          select: {
            currentOdometer: true,
          },
        },
      },
    }),
  ]);

  const dueMaintenanceSchedules = maintenanceScheduleAttentionList.filter((schedule) => {
    if (schedule.status === "DUE" || getScheduleStatus(schedule, schedule.vehicle) === "DUE") {
      return true;
    }

    return (
      schedule.nextDueDate !== null &&
      schedule.nextDueDate <= maintenanceAttentionDate
    );
  }).length;

  return {
    role: "ADMIN",
    metrics: {
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      totalDrivers,
      openWorkOrders,
      completedWorkOrders,
      fuelCostThisMonth: fuelCostResult._sum.totalAmount ?? 0,
      expiringDocuments,
      newFaultReports,
      dueMaintenanceSchedules,
    },
  };
}

async function getTechnicianDashboardSummary(userId) {
  const today = new Date();
  const maintenanceAttentionDate = addDays(today, 14);
  const assignedWhere = { technicianId: userId };

  const [
    assignedWorkOrders,
    openAssignedWorkOrders,
    inProgressWorkOrders,
    completedAssignedWorkOrders,
    urgentAssignedWorkOrders,
    dueAssignedWorkOrders,
  ] = await Promise.all([
    prisma.workOrder.count({ where: assignedWhere }),
    prisma.workOrder.count({
      where: {
        ...assignedWhere,
        status: { in: OPEN_WORK_ORDER_STATUSES },
      },
    }),
    prisma.workOrder.count({
      where: {
        ...assignedWhere,
        status: "IN_PROGRESS",
      },
    }),
    prisma.workOrder.count({
      where: {
        ...assignedWhere,
        status: { in: COMPLETED_WORK_ORDER_STATUSES },
      },
    }),
    prisma.workOrder.count({
      where: {
        ...assignedWhere,
        priority: "URGENT",
        status: { in: OPEN_WORK_ORDER_STATUSES },
      },
    }),
    prisma.workOrder.count({
      where: {
        ...assignedWhere,
        status: { in: OPEN_WORK_ORDER_STATUSES },
        dueDate: {
          not: null,
          lte: maintenanceAttentionDate,
        },
      },
    }),
  ]);

  return {
    role: "TECHNICIAN",
    metrics: {
      assignedWorkOrders,
      openAssignedWorkOrders,
      inProgressWorkOrders,
      completedAssignedWorkOrders,
      urgentAssignedWorkOrders,
      dueAssignedWorkOrders,
    },
  };
}

async function getDriverDashboardSummary(userId) {
  const reporterWhere = { reporterId: userId };

  const [
    submittedFaultReports,
    openFaultReports,
    reviewedFaultReports,
    convertedFaultReports,
    closedFaultReports,
  ] = await Promise.all([
    prisma.faultReport.count({ where: reporterWhere }),
    prisma.faultReport.count({
      where: {
        ...reporterWhere,
        status: "NEW",
      },
    }),
    prisma.faultReport.count({
      where: {
        ...reporterWhere,
        status: "REVIEWED",
      },
    }),
    prisma.faultReport.count({
      where: {
        ...reporterWhere,
        status: "CONVERTED_TO_WORK_ORDER",
      },
    }),
    prisma.faultReport.count({
      where: {
        ...reporterWhere,
        status: "CLOSED",
      },
    }),
  ]);

  return {
    role: "DRIVER",
    metrics: {
      submittedFaultReports,
      openFaultReports,
      reviewedFaultReports,
      convertedFaultReports,
      closedFaultReports,
    },
  };
}

async function getDashboardSummary(user) {
  if (user.role === "TECHNICIAN") {
    return getTechnicianDashboardSummary(user.userId);
  }

  if (user.role === "DRIVER") {
    return getDriverDashboardSummary(user.userId);
  }

  return getAdminDashboardSummary();
}

module.exports = {
  getDashboardSummary,
};
