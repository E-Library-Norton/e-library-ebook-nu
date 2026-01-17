// ============================================
// FILE: src/routes/publications.js
// ============================================

const express = require("express");
const router = express.Router();
const PublicationController = require("../controllers/publicationController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  publicationValidation,
  idValidation,
  queryValidation,
} = require("../middleware/validation");
const { uploadPublicationFiles } = require("../middleware/upload");

// Public routes
router.get("/", queryValidation.pagination, PublicationController.getAll);
router.get("/:id", idValidation, PublicationController.getById);
router.post("/:id/view", idValidation, PublicationController.incrementView);
router.post("/:id/download", idValidation, PublicationController.download);

// Protected routes (Admin & Librarian)
router.post(
  "/",
  authenticate,
  authorize("admin", "librarian"),
  uploadPublicationFiles,
  publicationValidation.create,
  PublicationController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "librarian"),
  uploadPublicationFiles,
  publicationValidation.update,
  PublicationController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  idValidation,
  PublicationController.delete
);

module.exports = router;
