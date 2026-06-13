const express = require("express");
const {
  createWorkOrder,
  deleteWorkOrder,
  getWorkOrderById,
  listTechnicians,
  listWorkOrders,
  updateWorkOrder,
  updateWorkOrderStatus,
} = require("../controllers/workOrderController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/technicians", requireRole("ADMIN"), listTechnicians);

router.get("/", requireRole("ADMIN", "TECHNICIAN"), listWorkOrders);
router.post("/", requireRole("ADMIN"), createWorkOrder);
router.get("/:id", requireRole("ADMIN", "TECHNICIAN"), getWorkOrderById);
router.put("/:id", requireRole("ADMIN", "TECHNICIAN"), updateWorkOrder);
router.patch("/:id/status", requireRole("ADMIN", "TECHNICIAN"), updateWorkOrderStatus);
router.delete("/:id", requireRole("ADMIN"), deleteWorkOrder);

module.exports = router;
