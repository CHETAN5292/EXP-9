// controllers/studentController.js
// PURPOSE: Business logic lives here — routes call these functions.
// MVC Pattern: Controller = the brain between routes and database.

const Student = require("../models/Student");

// ══════════════════════════════════════════════════════════════
// @desc    Create a new student
// @route   POST /api/students
// @access  Public
// ══════════════════════════════════════════════════════════════
const createStudent = async (req, res) => {
  try {
    const { name, email, course, age, phone } = req.body;

    // Check if email already exists
    const existing = await Student.findOne({ email: email?.toLowerCase() });
    if (existing) {
      return res.status(400).json({
        success: false,
        message: "A student with this email already exists.",
      });
    }

    // Create new student in MongoDB
    const student = await Student.create({ name, email, course, age, phone });

    res.status(201).json({
      success: true,
      message: "Student created successfully!",
      data: student,
    });
  } catch (error) {
    // Handle Mongoose validation errors nicely
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Get all students (with search + pagination)
// @route   GET /api/students
// @route   GET /api/students?search=john
// @route   GET /api/students?page=1&limit=5
// @route   GET /api/students?course=BCA&sort=name
// @access  Public
// ══════════════════════════════════════════════════════════════
const getAllStudents = async (req, res) => {
  try {
    // ── Query Parameters ───────────────────────────────────────
    const {
      search = "",        // search by name or course
      page = 1,           // current page number
      limit = 10,         // records per page
      sort = "createdAt", // field to sort by
      order = "desc",     // asc or desc
      course = "",        // filter by course
      minAge = "",        // filter by minimum age
      maxAge = "",        // filter by maximum age
    } = req.query;

    // ── Build filter object ────────────────────────────────────
    const filter = {};

    // Text search across name and course
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },    // case-insensitive
        { course: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    // Filter by course
    if (course) {
      filter.course = { $regex: course, $options: "i" };
    }

    // Filter by age range
    if (minAge || maxAge) {
      filter.age = {};
      if (minAge) filter.age.$gte = Number(minAge);
      if (maxAge) filter.age.$lte = Number(maxAge);
    }

    // ── Pagination Calculations ────────────────────────────────
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit))); // max 100 per page
    const skip = (pageNum - 1) * limitNum;
    const sortOrder = order === "asc" ? 1 : -1;

    // ── Run DB Query ───────────────────────────────────────────
    const [students, total] = await Promise.all([
      Student.find(filter)
        .sort({ [sort]: sortOrder })
        .skip(skip)
        .limit(limitNum),
      Student.countDocuments(filter),
    ]);

    // ── Send Response ──────────────────────────────────────────
    res.status(200).json({
      success: true,
      message: "Students fetched successfully!",
      data: students,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum),
        hasNextPage: pageNum < Math.ceil(total / limitNum),
        hasPrevPage: pageNum > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Get single student by ID
// @route   GET /api/students/:id
// @access  Public
// ══════════════════════════════════════════════════════════════
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${req.params.id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Student fetched successfully!",
      data: student,
    });
  } catch (error) {
    // CastError = invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid student ID format." });
    }
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Update a student by ID
// @route   PUT /api/students/:id
// @access  Public
// ══════════════════════════════════════════════════════════════
const updateStudent = async (req, res) => {
  try {
    const { name, email, course, age, phone, isActive } = req.body;

    // Check if email is being changed to one that already exists
    if (email) {
      const existing = await Student.findOne({
        email: email.toLowerCase(),
        _id: { $ne: req.params.id }, // exclude current student
      });
      if (existing) {
        return res.status(400).json({
          success: false,
          message: "Another student already uses this email.",
        });
      }
    }

    // findByIdAndUpdate with:
    // { new: true }         → return the updated document (not the old one)
    // { runValidators: true } → run schema validators on the update
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, course, age, phone, isActive },
      { new: true, runValidators: true }
    );

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${req.params.id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: "Student updated successfully!",
      data: student,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages[0] });
    }
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid student ID format." });
    }
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Delete a student by ID
// @route   DELETE /api/students/:id
// @access  Public
// ══════════════════════════════════════════════════════════════
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: `Student with ID ${req.params.id} not found.`,
      });
    }

    res.status(200).json({
      success: true,
      message: `Student "${student.name}" deleted successfully!`,
      data: student,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid student ID format." });
    }
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// @desc    Get statistics about students
// @route   GET /api/students/stats
// @access  Public
// ══════════════════════════════════════════════════════════════
const getStats = async (req, res) => {
  try {
    const [total, active, courseGroups, ageStats] = await Promise.all([
      Student.countDocuments(),
      Student.countDocuments({ isActive: true }),
      Student.aggregate([
        { $group: { _id: "$course", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Student.aggregate([
        {
          $group: {
            _id: null,
            avgAge: { $avg: "$age" },
            minAge: { $min: "$age" },
            maxAge: { $max: "$age" },
          },
        },
      ]),
    ]);

    res.status(200).json({
      success: true,
      data: {
        totalStudents: total,
        activeStudents: active,
        inactiveStudents: total - active,
        courseBreakdown: courseGroups,
        ageStats: ageStats[0] || { avgAge: 0, minAge: 0, maxAge: 0 },
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
};

module.exports = {
  createStudent,
  getAllStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  getStats,
};
