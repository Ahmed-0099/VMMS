const MAINTENANCE_SCHEDULE_STATUSES = ["ACTIVE", "DUE", "COMPLETED", "CANCELLED"];
const LOCKED_MAINTENANCE_STATUSES = ["COMPLETED", "CANCELLED"];

function normalizeMaintenanceScheduleStatus(status, fallback = "ACTIVE") {
  const normalizedStatus = String(status ?? fallback).trim().toUpperCase();
  return MAINTENANCE_SCHEDULE_STATUSES.includes(normalizedStatus) ? normalizedStatus : null;
}

function startOfDay(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function getScheduleStatus(schedule, vehicle, referenceDate = new Date()) {
  if (LOCKED_MAINTENANCE_STATUSES.includes(schedule.status)) {
    return schedule.status;
  }

  const today = startOfDay(referenceDate);
  const dueByDate = schedule.nextDueDate ? startOfDay(schedule.nextDueDate).getTime() <= today.getTime() : false;
  const dueByOdometer =
    schedule.nextDueOdometer !== null &&
    schedule.nextDueOdometer !== undefined &&
    vehicle?.currentOdometer !== null &&
    vehicle?.currentOdometer !== undefined &&
    vehicle.currentOdometer >= schedule.nextDueOdometer;

  return dueByDate || dueByOdometer ? "DUE" : "ACTIVE";
}

module.exports = {
  MAINTENANCE_SCHEDULE_STATUSES,
  getScheduleStatus,
  normalizeMaintenanceScheduleStatus,
};
