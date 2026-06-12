const express = require("express");
const prisma = require("../config/prisma");

const router = express.Router();

router.get("/summary", async (req, res, next) => {
  try {
    const [
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      totalDrivers,
      openWorkOrders,
      completedWorkOrders,
      expiringDocuments,
    ] = await Promise.all([
      prisma.vehicle.count(),
      prisma.vehicle.count({ where: { status: "ACTIVE" } }),
      prisma.vehicle.count({ where: { status: "IN_MAINTENANCE" } }),
      prisma.driver.count(),
      prisma.workOrder.count({ where: { status: { in: ["OPEN", "IN_PROGRESS", "PENDING_PARTS"] } } }),
      prisma.workOrder.count({ where: { status: "COMPLETED" } }),
      prisma.complianceDocument.count({ where: { status: { in: ["EXPIRING_SOON", "EXPIRED"] } } }),
    ]);

    res.json({
      totalVehicles,
      activeVehicles,
      vehiclesInMaintenance,
      totalDrivers,
      openWorkOrders,
      completedWorkOrders,
      expiringDocuments,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
