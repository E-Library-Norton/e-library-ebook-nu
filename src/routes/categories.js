// ============================================
// FILE: src/routes/categories.js
// ============================================

const express = require("express");
const router = express.Router();
const CategoryController = require("../controllers/categoryController");
const { authenticate, authorize } = require("../middleware/auth");
const { idValidation } = require("../middleware/validation");

router.get("/", CategoryController.getAll);

router.post("/", authenticate, authorize("admin"), CategoryController.create);

router.put(
  "/:id",
  authenticate, 
  authorize("admin"),
  idValidation,
  CategoryController.update
);

router.delete(
  "/:id",
  authenticate,
  authorize("admin"),
  idValidation,
  CategoryController.delete
);

module.exports = router;
