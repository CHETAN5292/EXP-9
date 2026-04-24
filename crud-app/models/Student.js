// models/Student.js
// PURPOSE: Define the shape (schema) of a Student document in MongoDB.
// Mongoose converts this into a MongoDB collection called "students".

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    // ── Required Fields ────────────────────────────────────────
    name: {
      type: String,
      required: [true, "Student name is required"],
      trim: true,                          // removes leading/trailing spaces
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [100, "Name cannot exceed 100 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,                        // no two students with same email
      lowercase: true,                     // always stored as lowercase
      trim: true,
      match: [
        /^\S+@\S+\.\S+$/,
        "Please enter a valid email address",
      ],
    },

    course: {
      type: String,
      required: [true, "Course name is required"],
      trim: true,
      maxlength: [100, "Course name cannot exceed 100 characters"],
    },

    age: {
      type: Number,
      required: [true, "Age is required"],
      min: [10, "Age must be at least 10"],
      max: [100, "Age cannot exceed 100"],
    },

    // ── Optional Fields ────────────────────────────────────────
    phone: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

// ── Index for faster search by name ────────────────────────────
studentSchema.index({ name: "text", course: "text" });

// ── Export the model ────────────────────────────────────────────
// Mongoose will create/use a collection named "students" (lowercased + plural)
module.exports = mongoose.model("Student", studentSchema);
