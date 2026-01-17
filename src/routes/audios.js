// ============================================
// FILE: src/routes/audios.js
// ============================================

const express = require("express");
const router = express.Router();
const AudioController = require("../controllers/audioController");
const { authenticate, authorize } = require("../middleware/auth");
const {
  audioValidation,
  idValidation,
  queryValidation,
} = require("../middleware/validation");
const { uploadAudioFiles } = require("../middleware/upload");

// Public routes
router.get("/", queryValidation.pagination, AudioController.getAll);
router.get("/:id", idValidation, AudioController.getById);
router.post("/:id/play", idValidation, AudioController.incrementPlay);
router.post("/:id/download", idValidation, AudioController.download);

// Protected routes (Admin & Librarian)
router.post(
  "/",
  authenticate,
  authorize("admin", "librarian"),
  uploadAudioFiles,
  audioValidation.create,
  AudioController.create
);

router.put(
  "/:id",
  authenticate,
  authorize("admin", "librarian"),
  uploadAudioFiles,
  audioValidation.update,
  AudioController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  idValidation,
  AudioController.delete
);

module.exports = router;
