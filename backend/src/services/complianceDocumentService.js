const prisma = require("../config/prisma");
const { getComplianceStatus } = require("../utils/documentStatus");
const { createHttpError } = require("../utils/httpError");

const complianceDocumentInclude = {
  vehicle: {
    select: {
      id: true,
      registrationNumber: true,
      make: true,
      model: true,
      status: true,
    },
  },
};

function buildDocumentWhere(filters = {}) {
  const where = {};

  if (filters.vehicleId) {
    where.vehicleId = filters.vehicleId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.documentType) {
    where.documentType = {
      contains: filters.documentType,
      mode: "insensitive",
    };
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

  return vehicle;
}

async function findDocumentById(id) {
  return prisma.complianceDocument.findUnique({
    where: { id },
    include: complianceDocumentInclude,
  });
}

async function refreshDocumentStatuses() {
  const documents = await prisma.complianceDocument.findMany({
    select: {
      id: true,
      expiryDate: true,
      status: true,
    },
  });

  const updates = documents
    .map((document) => ({
      currentStatus: document.status,
      id: document.id,
      nextStatus: getComplianceStatus(document.expiryDate),
    }))
    .filter((document) => document.currentStatus !== document.nextStatus);

  await Promise.all(
    updates.map((document) =>
      prisma.complianceDocument.update({
        where: { id: document.id },
        data: { status: document.nextStatus },
      }),
    ),
  );
}

async function findDocuments(filters) {
  await refreshDocumentStatuses();

  return prisma.complianceDocument.findMany({
    where: buildDocumentWhere(filters),
    orderBy: [{ status: "asc" }, { expiryDate: "asc" }, { createdAt: "desc" }],
    include: complianceDocumentInclude,
  });
}

async function createDocument(data) {
  await validateVehicle(data.vehicleId);

  const document = await prisma.complianceDocument.create({
    data: {
      ...data,
      status: getComplianceStatus(data.expiryDate),
    },
  });

  return findDocumentById(document.id);
}

async function updateDocument(id, data) {
  const document = await findDocumentById(id);

  if (!document) {
    throw createHttpError(404, "Compliance document not found");
  }

  await validateVehicle(data.vehicleId);

  await prisma.complianceDocument.update({
    where: { id },
    data: {
      ...data,
      status: getComplianceStatus(data.expiryDate),
    },
  });

  return findDocumentById(id);
}

async function deleteDocument(id) {
  const document = await findDocumentById(id);

  if (!document) {
    throw createHttpError(404, "Compliance document not found");
  }

  await prisma.complianceDocument.delete({
    where: { id },
  });
}

module.exports = {
  createDocument,
  deleteDocument,
  findDocumentById,
  findDocuments,
  refreshDocumentStatuses,
  updateDocument,
};
