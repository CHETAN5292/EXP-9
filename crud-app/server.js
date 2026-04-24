// server.js
// PURPOSE: Entry point of the application.
// Sets up Express middleware, connects to MongoDB, registers routes.

require("dotenv").config(); // Load .env file FIRST
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");

const app = express();

// ── Connect to MongoDB ──────────────────────────────────────────
connectDB();

// ── Middleware ──────────────────────────────────────────────────
// CORS: allows the React frontend to call this backend
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

// Parse incoming JSON request bodies (req.body)
app.use(express.json());

// Parse URL-encoded form data
app.use(express.urlencoded({ extended: true }));

// ── Request Logger (Development) ───────────────────────────────
if (process.env.NODE_ENV === "development") {
  app.use((req, res, next) => {
    console.log(`📡 ${req.method} ${req.url}`);
    next();
  });
}

// ── API Routes ──────────────────────────────────────────────────
app.use("/api/students", require("./routes/studentRoutes"));

// ── Root route (health check) ───────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🎓 Student Management API is running!",
    version: "1.0.0",
    endpoints: {
      "POST   /api/students":        "Create a student",
      "GET    /api/students":        "Get all students (+ search & pagination)",
      "GET    /api/students/stats":  "Get statistics",
      "GET    /api/students/:id":    "Get student by ID",
      "PUT    /api/students/:id":    "Update student",
      "DELETE /api/students/:id":    "Delete student",
    },
    queryParams: {
      search: "?search=john         → search by name/email/course",
      page:   "?page=1&limit=5      → pagination",
      filter: "?course=BCA&minAge=18 → filters",
      sort:   "?sort=name&order=asc  → sorting",
    },
  });
});

// ── API health check ─────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.json({ success: true, status: "healthy", timestamp: new Date() });
});

// ── 404 handler (unknown routes) ────────────────────────────────
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found.`,
  });
});

// ── Global Error Handler ─────────────────────────────────────────
// Catches any error passed via next(error) in route handlers
app.use((err, req, res, next) => {
  console.error("💥 Unhandled Error:", err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

// ── Start Server ─────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`📖 API Docs:    http://localhost:${PORT}/`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
});
