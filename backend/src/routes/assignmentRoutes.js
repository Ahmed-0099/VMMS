const express = require("express");
const {
  createAssignment,
  endAssignment,
  getMyActiveAssignment,
  listAssignments,
} = require("../controllers/assignmentController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);

router.get("/my-active", requireRole("DRIVER"), getMyActiveAssignment);

router.use(requireRole("ADMIN"));

router.get("/", listAssignments);
router.post("/", createAssignment);
router.patch("/:id/end", endAssignment);

module.exports = router;
