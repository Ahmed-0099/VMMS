const COMPLIANCE_DOCUMENT_STATUSES = ["VALID", "EXPIRING_SOON", "EXPIRED"];
const EXPIRING_SOON_DAYS = 30;

function startOfDay(date) {
  const normalizedDate = new Date(date);
  normalizedDate.setHours(0, 0, 0, 0);
  return normalizedDate;
}

function addDays(date, days) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function getComplianceStatus(expiryDate, referenceDate = new Date()) {
  const expiryDay = startOfDay(expiryDate);
  const today = startOfDay(referenceDate);
  const attentionDate = startOfDay(addDays(today, EXPIRING_SOON_DAYS));

  if (expiryDay.getTime() < today.getTime()) {
    return "EXPIRED";
  }

  if (expiryDay.getTime() <= attentionDate.getTime()) {
    return "EXPIRING_SOON";
  }

  return "VALID";
}

function normalizeComplianceDocumentStatus(status, fallback = "VALID") {
  const normalizedStatus = String(status ?? "").trim().toUpperCase();
  return COMPLIANCE_DOCUMENT_STATUSES.includes(normalizedStatus) ? normalizedStatus : fallback;
}

module.exports = {
  COMPLIANCE_DOCUMENT_STATUSES,
  getComplianceStatus,
  normalizeComplianceDocumentStatus,
};
