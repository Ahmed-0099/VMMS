const WORK_ORDER_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];
const WORK_ORDER_STATUSES = ["OPEN", "IN_PROGRESS", "PENDING_PARTS", "COMPLETED", "CLOSED"];

const STATUS_TRANSITIONS = {
  OPEN: ["IN_PROGRESS"],
  IN_PROGRESS: ["PENDING_PARTS", "COMPLETED"],
  PENDING_PARTS: ["IN_PROGRESS"],
  COMPLETED: ["CLOSED"],
  CLOSED: [],
};

function normalizeWorkOrderPriority(priority, fallback = "MEDIUM") {
  const normalizedPriority = String(priority ?? fallback).trim().toUpperCase();
  return WORK_ORDER_PRIORITIES.includes(normalizedPriority) ? normalizedPriority : null;
}

function normalizeWorkOrderStatus(status, fallback = "OPEN") {
  const normalizedStatus = String(status ?? fallback).trim().toUpperCase();
  return WORK_ORDER_STATUSES.includes(normalizedStatus) ? normalizedStatus : null;
}

function canTransitionWorkOrderStatus(currentStatus, nextStatus) {
  return STATUS_TRANSITIONS[currentStatus]?.includes(nextStatus) ?? false;
}

module.exports = {
  WORK_ORDER_PRIORITIES,
  WORK_ORDER_STATUSES,
  canTransitionWorkOrderStatus,
  normalizeWorkOrderPriority,
  normalizeWorkOrderStatus,
};
