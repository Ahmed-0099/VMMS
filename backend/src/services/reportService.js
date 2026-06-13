const prisma = require("../config/prisma");
const { refreshDocumentStatuses } = require("./complianceDocumentService");

const VEHICLE_STATUS_LABELS = {
  ACTIVE: "Active",
  IN_MAINTENANCE: "In Maintenance",
  OUT_OF_SERVICE: "Out of Service",
};

const WORK_ORDER_STATUS_LABELS = {
  CLOSED: "Closed",
  COMPLETED: "Completed",
  IN_PROGRESS: "In Progress",
  OPEN: "Open",
  PENDING_PARTS: "Pending Parts",
};

const COMPLIANCE_STATUS_LABELS = {
  EXPIRED: "Expired",
  EXPIRING_SOON: "Expiring Soon",
  VALID: "Valid",
};

const OPEN_WORK_ORDER_STATUSES = ["OPEN", "IN_PROGRESS", "PENDING_PARTS"];
const COMPLETED_WORK_ORDER_STATUSES = ["COMPLETED", "CLOSED"];

function addDateRange(where, fieldName, filters) {
  if (!filters.from && !filters.to) {
    return where;
  }

  return {
    ...where,
    [fieldName]: {
      ...(filters.from ? { gte: filters.from } : {}),
      ...(filters.to ? { lte: filters.to } : {}),
    },
  };
}

function getVehicleDisplay(vehicle) {
  return `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.model}`;
}

function getStatusRows(statusLabels, counts, totals = {}) {
  return Object.entries(statusLabels).map(([status, label]) => ({
    count: counts[status] ?? 0,
    label,
    status,
    totalCost: totals[status] ?? 0,
  }));
}

function sortByLabel(rows) {
  return rows.sort((firstRow, secondRow) => firstRow.label.localeCompare(secondRow.label));
}

function buildVehicleWhere(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.id = filters.vehicleId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return addDateRange(where, "createdAt", filters);
}

function buildFuelWhere(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.status) {
    where.vehicle = {
      status: filters.status,
    };
  }

  return addDateRange(where, "date", filters);
}

function buildWorkOrderWhere(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return addDateRange(where, "createdAt", filters);
}

function buildComplianceWhere(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  return addDateRange(where, "expiryDate", filters);
}

function getVehicleMapRows(logs) {
  const vehicleMap = new Map();

  logs.forEach((log) => {
    const currentRow = vehicleMap.get(log.vehicleId) ?? {
      averageUnitCost: 0,
      logCount: 0,
      totalCost: 0,
      totalQuantity: 0,
      vehicle: getVehicleDisplay(log.vehicle),
      vehicleId: log.vehicleId,
    };

    currentRow.logCount += 1;
    currentRow.totalCost += log.totalAmount;
    currentRow.totalQuantity += log.quantity;
    currentRow.averageUnitCost = currentRow.totalQuantity > 0 ? currentRow.totalCost / currentRow.totalQuantity : 0;
    vehicleMap.set(log.vehicleId, currentRow);
  });

  return sortByLabel(Array.from(vehicleMap.values()).map((row) => ({ ...row, label: row.vehicle })));
}

function getFuelDateRows(logs) {
  const dateMap = new Map();

  logs.forEach((log) => {
    const date = log.date.toISOString().slice(0, 10);
    const currentRow = dateMap.get(date) ?? {
      date,
      label: date,
      logCount: 0,
      totalCost: 0,
      totalQuantity: 0,
    };

    currentRow.logCount += 1;
    currentRow.totalCost += log.totalAmount;
    currentRow.totalQuantity += log.quantity;
    dateMap.set(date, currentRow);
  });

  return Array.from(dateMap.values()).sort((firstRow, secondRow) => firstRow.date.localeCompare(secondRow.date));
}

function getWorkOrderVehicleRows(workOrders) {
  const vehicleMap = new Map();

  workOrders.forEach((workOrder) => {
    const currentRow = vehicleMap.get(workOrder.vehicleId) ?? {
      count: 0,
      label: getVehicleDisplay(workOrder.vehicle),
      totalCost: 0,
      vehicle: getVehicleDisplay(workOrder.vehicle),
      vehicleId: workOrder.vehicleId,
    };

    currentRow.count += 1;
    currentRow.totalCost += workOrder.cost ?? 0;
    vehicleMap.set(workOrder.vehicleId, currentRow);
  });

  return sortByLabel(Array.from(vehicleMap.values()));
}

function getComplianceVehicleRows(documents) {
  const vehicleMap = new Map();

  documents.forEach((document) => {
    const currentRow = vehicleMap.get(document.vehicleId) ?? {
      count: 0,
      expired: 0,
      expiringSoon: 0,
      label: getVehicleDisplay(document.vehicle),
      valid: 0,
      vehicle: getVehicleDisplay(document.vehicle),
      vehicleId: document.vehicleId,
    };

    currentRow.count += 1;

    if (document.status === "EXPIRED") {
      currentRow.expired += 1;
    }

    if (document.status === "EXPIRING_SOON") {
      currentRow.expiringSoon += 1;
    }

    if (document.status === "VALID") {
      currentRow.valid += 1;
    }

    vehicleMap.set(document.vehicleId, currentRow);
  });

  return sortByLabel(Array.from(vehicleMap.values()));
}

async function getVehicleSummary(filters) {
  const vehicles = await prisma.vehicle.findMany({
    where: buildVehicleWhere(filters),
    orderBy: [{ status: "asc" }, { registrationNumber: "asc" }],
    select: {
      id: true,
      registrationNumber: true,
      make: true,
      model: true,
      status: true,
    },
  });

  const counts = vehicles.reduce((statusCounts, vehicle) => {
    statusCounts[vehicle.status] = (statusCounts[vehicle.status] ?? 0) + 1;
    return statusCounts;
  }, {});

  return {
    rows: getStatusRows(VEHICLE_STATUS_LABELS, counts),
    summary: {
      active: counts.ACTIVE ?? 0,
      inMaintenance: counts.IN_MAINTENANCE ?? 0,
      outOfService: counts.OUT_OF_SERVICE ?? 0,
      totalVehicles: vehicles.length,
    },
    vehicles: vehicles.map((vehicle) => ({
      id: vehicle.id,
      label: getVehicleDisplay(vehicle),
      registrationNumber: vehicle.registrationNumber,
      status: vehicle.status,
    })),
  };
}

async function getFuelSummary(filters) {
  const where = buildFuelWhere(filters);
  const [logs, totals] = await Promise.all([
    prisma.fuelLog.findMany({
      where,
      orderBy: [{ date: "asc" }, { createdAt: "asc" }],
      include: {
        vehicle: {
          select: {
            make: true,
            model: true,
            registrationNumber: true,
          },
        },
      },
    }),
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
    dateRows: getFuelDateRows(logs),
    rows: getVehicleMapRows(logs),
    summary: {
      averageUnitCost: totals._avg.unitCost ?? 0,
      logCount: logs.length,
      totalCost: totals._sum.totalAmount ?? 0,
      totalQuantity: totals._sum.quantity ?? 0,
    },
  };
}

async function getWorkOrderSummary(filters) {
  const workOrders = await prisma.workOrder.findMany({
    where: buildWorkOrderWhere(filters),
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: {
      vehicle: {
        select: {
          make: true,
          model: true,
          registrationNumber: true,
        },
      },
    },
  });

  const counts = {};
  const costs = {};
  let totalCost = 0;

  workOrders.forEach((workOrder) => {
    counts[workOrder.status] = (counts[workOrder.status] ?? 0) + 1;
    costs[workOrder.status] = (costs[workOrder.status] ?? 0) + (workOrder.cost ?? 0);
    totalCost += workOrder.cost ?? 0;
  });

  return {
    rows: getStatusRows(WORK_ORDER_STATUS_LABELS, counts, costs),
    summary: {
      completedCount: workOrders.filter((workOrder) => COMPLETED_WORK_ORDER_STATUSES.includes(workOrder.status)).length,
      openCount: workOrders.filter((workOrder) => OPEN_WORK_ORDER_STATUSES.includes(workOrder.status)).length,
      totalCost,
      totalWorkOrders: workOrders.length,
    },
    vehicleRows: getWorkOrderVehicleRows(workOrders),
  };
}

async function getComplianceSummary(filters) {
  await refreshDocumentStatuses();

  const documents = await prisma.complianceDocument.findMany({
    where: buildComplianceWhere(filters),
    orderBy: [{ status: "asc" }, { expiryDate: "asc" }],
    include: {
      vehicle: {
        select: {
          make: true,
          model: true,
          registrationNumber: true,
        },
      },
    },
  });

  const counts = documents.reduce((statusCounts, document) => {
    statusCounts[document.status] = (statusCounts[document.status] ?? 0) + 1;
    return statusCounts;
  }, {});

  return {
    rows: getStatusRows(COMPLIANCE_STATUS_LABELS, counts),
    summary: {
      expiredCount: counts.EXPIRED ?? 0,
      expiringSoonCount: counts.EXPIRING_SOON ?? 0,
      totalDocuments: documents.length,
      validCount: counts.VALID ?? 0,
    },
    vehicleRows: getComplianceVehicleRows(documents),
  };
}

module.exports = {
  getComplianceSummary,
  getFuelSummary,
  getVehicleSummary,
  getWorkOrderSummary,
};
