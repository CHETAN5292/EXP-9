// routes/studentRoutes.js
// PURPOSE: Map HTTP methods + URLs to controller functions.
// Routes are like a "menu" — they say what's available and who handles it.

const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

const {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStats,
} = require("../controllers/studentController");

// ── Validation Rules ───────────────────────────────────────────
// express-validator middleware that checks request body before controller runs
const createValidation = [
  body("name")
    .notEmpty().withMessage("Name is required")
    .isLength({ min: 2 }).withMessage("Name must be at least 2 characters")
    .trim(),
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("course")
    .notEmpty().withMessage("Course is required")
    .trim(),
  body("age")
    .notEmpty().withMessage("Age is required")
    .isInt({ min: 10, max: 100 }).withMessage("Age must be between 10 and 100"),
];

const updateValidation = [
  body("email")
    .optional()
    .isEmail().withMessage("Please enter a valid email address")
    .normalizeEmail(),
  body("age")
    .optional()
    .isInt({ min: 10, max: 100 }).withMessage("Age must be between 10 and 100"),
];

// ── Validation Error Handler (middleware) ──────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ══════════════════════════════════════════════════════════════
// ROUTES
// ══════════════════════════════════════════════════════════════

// GET  /api/students/stats   → Statistics (must be BEFORE /:id route)
router.get("/stats", getStats);

// POST /api/students         → Create student
router.post("/", createValidation, handleValidation, createStudent);

// GET  /api/students         → Get all students (with search & pagination)
router.get("/", getAllStudents);

// GET  /api/students/:id     → Get single student
router.get("/:id", getStudentById);

// PUT  /api/students/:id     → Update student
router.put("/:id", updateValidation, handleValidation, updateStudent);

// DELETE /api/students/:id   → Delete student
router.delete("/:id", deleteStudent);

module.exports = router;
