// ============================================
// FILE: src/routes/upload.js
// ============================================

const express = require("express");
const router = express.Router();
const UploadController = require("../controllers/uploadController");
const { authenticate, authorize } = require("../middleware/auth");
const { uploadSingle } = require("../middleware/upload");

// Upload endpoints (Admin & Librarian only)
router.post(
  "/single",
  authenticate,
  authorize("admin", "librarian"),
  uploadSingle,
  UploadController.uploadSingle
);

router.post(
  "/delete",
  authenticate,
  authorize("admin", "librarian"),
  UploadController.deleteFile
);

module.exports = router;
