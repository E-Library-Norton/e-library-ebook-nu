// ============================================
// FILE: src/routes/journals.js
// ============================================

const express = require("express");
const router = express.Router();
const JournalController = require("../controllers/journalController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  journalValidation,
  idValidation,
  queryValidation,
} = require("../middleware/validation");
const { uploadJournalFiles } = require("../middleware/upload");

// Public routes
router.get("/", queryValidation.pagination, JournalController.getAll);
router.get("/:id", idValidation, JournalController.getById);
router.post("/:id/view", idValidation, JournalController.incrementView);
router.post("/:id/download", idValidation, JournalController.download);

// Protected routes
router.post(
  "/",
  authenticate,
  authorize("admin", "librarian"),
  uploadJournalFiles,
  journalValidation.create,
  JournalController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "librarian"),
  uploadJournalFiles,
  idValidation,
  JournalController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  idValidation,
  JournalController.delete
);

module.exports = router;
