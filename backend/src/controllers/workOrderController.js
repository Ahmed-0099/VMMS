const {
  createWorkOrder: createWorkOrderRecord,
  deleteWorkOrder: deleteWorkOrderRecord,
  findTechnicians,
  findWorkOrderById,
  findWorkOrders,
  updateWorkOrder: updateWorkOrderRecord,
  updateWorkOrderProgress,
  updateWorkOrderStatus: updateWorkOrderStatusRecord,
} = require("../services/workOrderService");
const { createHttpError } = require("../utils/httpError");
const { normalizeWorkOrderPriority, normalizeWorkOrderStatus } = require("../utils/workOrderStatus");

function cleanOptionalString(value) {
  const normalizedValue = String(value ?? "").trim();
  return normalizedValue || null;
}

function cleanRequiredString(value, fieldName) {
  const normalizedValue = cleanOptionalString(value);

  if (!normalizedValue) {
    throw createHttpError(400, `${fieldName} is required`);
  }

  return normalizedValue;
}

function parseOptionalDate(value, fieldName) {
  if (value === undefined || value === null || String(value).trim() === "") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw createHttpError(400, `${fieldName} must be a valid date`);
  }

  return date;
}

function parseOptionalNonNegativeNumber(value, fieldName) {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue) || parsedValue < 0) {
    throw createHttpError(400, `${fieldName} must be a non-negative number`);
  }

  return parsedValue;
}

function getWorkOrderFilters(query, user) {
  const status = query.status ? normalizeWorkOrderStatus(query.status, null) : null;
  const priority = query.priority ? normalizeWorkOrderPriority(query.priority, null) : null;

  if (query.status && !status) {
    throw createHttpError(400, "Work order status filter is invalid");
  }

  if (query.priority && !priority) {
    throw createHttpError(400, "Work order priority filter is invalid");
  }

  return {
    priority,
    status,
    technicianId: user.role === "TECHNICIAN" ? user.userId : cleanOptionalString(query.technicianId),
    vehicleId: cleanOptionalString(query.vehicleId),
  };
}

function validateWorkOrderPayload(payload) {
  const priority = normalizeWorkOrderPriority(payload.priority);
  const status = normalizeWorkOrderStatus(payload.status);

  if (!priority) {
    throw createHttpError(400, "Work order priority is invalid");
  }

  if (!status) {
    throw createHttpError(400, "Work order status is invalid");
  }

  return {
    vehicleId: cleanRequiredString(payload.vehicleId, "Vehicle"),
    technicianId: cleanOptionalString(payload.technicianId),
    maintenanceScheduleId: cleanOptionalString(payload.maintenanceScheduleId),
    priority,
    status,
    serviceType: cleanRequiredString(payload.serviceType, "Service type"),
    description: cleanRequiredString(payload.description, "Description"),
    dueDate: parseOptionalDate(payload.dueDate, "Due date"),
    laborHours: parseOptionalNonNegativeNumber(payload.laborHours, "Labor hours"),
    cost: parseOptionalNonNegativeNumber(payload.cost, "Cost"),
    completionNotes: cleanOptionalString(payload.completionNotes),
  };
}

function validateProgressPayload(payload) {
  return {
    laborHours: parseOptionalNonNegativeNumber(payload.laborHours, "Labor hours"),
    cost: parseOptionalNonNegativeNumber(payload.cost, "Cost"),
    completionNotes: cleanOptionalString(payload.completionNotes),
  };
}

function validateStatusPayload(payload) {
  const status = normalizeWorkOrderStatus(payload.status, null);

  if (!status) {
    throw createHttpError(400, "Work order status is invalid");
  }

  return status;
}

async function listWorkOrders(req, res, next) {
  try {
    const workOrders = await findWorkOrders(getWorkOrderFilters(req.query, req.user));
    res.json({ workOrders });
  } catch (error) {
    next(error);
  }
}

async function listTechnicians(req, res, next) {
  try {
    const technicians = await findTechnicians();
    res.json({ technicians });
  } catch (error) {
    next(error);
  }
}

async function getWorkOrderById(req, res, next) {
  try {
    const workOrder = await findWorkOrderById(req.params.id);

    if (!workOrder) {
      throw createHttpError(404, "Work order not found");
    }

    if (req.user.role === "TECHNICIAN" && workOrder.technicianId !== req.user.userId) {
      throw createHttpError(403, "You do not have permission to access this work order");
    }

    res.json({ workOrder });
  } catch (error) {
    next(error);
  }
}

async function createWorkOrder(req, res, next) {
  try {
    const workOrder = await createWorkOrderRecord(validateWorkOrderPayload(req.body));

    res.status(201).json({
      message: "Work order created successfully",
      workOrder,
    });
  } catch (error) {
    next(error);
  }
}

async function updateWorkOrder(req, res, next) {
  try {
    const workOrder =
      req.user.role === "TECHNICIAN"
        ? await updateWorkOrderProgress(req.params.id, validateProgressPayload(req.body), req.user.userId)
        : await updateWorkOrderRecord(req.params.id, validateWorkOrderPayload(req.body));

    res.json({
      message: "Work order updated successfully",
      workOrder,
    });
  } catch (error) {
    next(error);
  }
}

async function updateWorkOrderStatus(req, res, next) {
  try {
    const workOrder = await updateWorkOrderStatusRecord(req.params.id, validateStatusPayload(req.body), req.user);

    res.json({
      message: "Work order status updated successfully",
      workOrder,
    });
  } catch (error) {
    next(error);
  }
}

async function deleteWorkOrder(req, res, next) {
  try {
    await deleteWorkOrderRecord(req.params.id);

    res.json({
      message: "Work order deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createWorkOrder,
  deleteWorkOrder,
  getWorkOrderById,
  listTechnicians,
  listWorkOrders,
  updateWorkOrder,
  updateWorkOrderStatus,
};
