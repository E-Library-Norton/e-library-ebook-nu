// ============================================
// FILE: src/routes/videos.js
// ============================================

const express = require("express");
const router = express.Router();
const VideoController = require("../controllers/videoController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  videoValidation,
  idValidation,
  queryValidation,
} = require("../middleware/validation");
const { uploadVideoFiles } = require("../middleware/upload");

// Public routes
router.get("/", queryValidation.pagination, VideoController.getAll);
router.get("/trending", VideoController.getTrending);
router.get("/:id", idValidation, VideoController.getById);
router.post("/:id/view", idValidation, VideoController.incrementView);

// Protected routes (Admin & Librarian)
router.post(
  "/",
  authenticate,
  authorize("admin", "librarian"),
  uploadVideoFiles,
  videoValidation.create,
  VideoController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "librarian"),
  uploadVideoFiles,
  videoValidation.update,
  VideoController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  idValidation,
  VideoController.delete
);

module.exports = router;
