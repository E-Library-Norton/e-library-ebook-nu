// ============================================
// FILE: src/routes/thesis.js
// ============================================

const express = require("express");
const router = express.Router();
const ThesisController = require("../controllers/thesisController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  thesisValidation,
  idValidation,
  queryValidation,
} = require("../middleware/validation");
const { uploadThesisFiles } = require("../middleware/upload");

// Public routes
router.get("/", queryValidation.pagination, ThesisController.getAll);
router.get("/:id", idValidation, ThesisController.getById);
router.post("/:id/view", idValidation, ThesisController.incrementView);
router.post("/:id/download", idValidation, ThesisController.download);
// Protected routes (Admin & Librarian)
router.post(
  "/",
  authenticate,
  authorize("admin", "librarian"),
  uploadThesisFiles,
  thesisValidation.create,  
  ThesisController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "librarian"),
  uploadThesisFiles,
  thesisValidation.update,
  ThesisController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  idValidation,
  ThesisController.delete
);

module.exports = router;
