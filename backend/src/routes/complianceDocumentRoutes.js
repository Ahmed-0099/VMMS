const express = require("express");
const {
  createDocument,
  deleteDocument,
  listDocuments,
  updateDocument,
} = require("../controllers/complianceDocumentController");
const { requireAuth } = require("../middleware/authMiddleware");
const { requireRole } = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(requireAuth);
router.use(requireRole("ADMIN"));

router.get("/", listDocuments);
router.post("/", createDocument);
router.put("/:id", updateDocument);
router.delete("/:id", deleteDocument);

module.exports = router;
