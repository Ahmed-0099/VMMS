const FAULT_URGENCIES = ["LOW", "MEDIUM", "HIGH"];
const FAULT_REPORT_STATUSES = ["NEW", "REVIEWED", "CONVERTED_TO_WORK_ORDER", "CLOSED"];

function normalizeFaultUrgency(urgency, fallback = "MEDIUM") {
  const normalizedUrgency = String(urgency ?? fallback).trim().toUpperCase();
  return FAULT_URGENCIES.includes(normalizedUrgency) ? normalizedUrgency : null;
}

function normalizeFaultReportStatus(status, fallback = "NEW") {
  const normalizedStatus = String(status ?? fallback).trim().toUpperCase();
  return FAULT_REPORT_STATUSES.includes(normalizedStatus) ? normalizedStatus : null;
}

module.exports = {
  FAULT_REPORT_STATUSES,
  FAULT_URGENCIES,
  normalizeFaultReportStatus,
  normalizeFaultUrgency,
};
