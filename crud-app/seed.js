// seed.js — Run: node seed.js
// Populates the database with sample students for testing

require("dotenv").config();
const mongoose = require("mongoose");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/student_management";

const studentSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true },
  course: String, age: Number, phone: String,
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const Student = mongoose.model("Student", studentSchema);

const students = [
  { name: "Arjun Sharma",   email: "arjun@demo.com",   course: "B.Tech CSE",  age: 20, phone: "9876543210" },
  { name: "Priya Patel",    email: "priya@demo.com",   course: "BCA",         age: 19, phone: "9876543211" },
  { name: "Rahul Mehta",    email: "rahul@demo.com",   course: "MCA",         age: 23, phone: "9876543212" },
  { name: "Sneha Iyer",     email: "sneha@demo.com",   course: "B.Tech CSE",  age: 21, phone: "9876543213" },
  { name: "Vikram Singh",   email: "vikram@demo.com",  course: "BBA",         age: 22, phone: "9876543214" },
  { name: "Anjali Nair",    email: "anjali@demo.com",  course: "MBA",         age: 24, phone: "9876543215" },
  { name: "Rohit Gupta",    email: "rohit@demo.com",   course: "B.Sc CS",     age: 18, phone: "9876543216" },
  { name: "Kavya Reddy",    email: "kavya@demo.com",   course: "B.Tech IT",   age: 20, phone: "9876543217" },
  { name: "Aditya Kumar",   email: "aditya@demo.com",  course: "BCA",         age: 19, isActive: false },
  { name: "Pooja Sharma",   email: "pooja@demo.com",   course: "M.Tech CSE",  age: 25, phone: "9876543219" },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    await Student.deleteMany({});
    console.log("🧹 Cleared existing students");

    const created = await Student.insertMany(students);
    console.log(`🌱 Seeded ${created.length} students:`);
    created.forEach(s => console.log(`   → ${s.name} (${s.email})`));

    process.exit(0);
  } catch (err) {
    console.error("❌ Seed error:", err.message);
    process.exit(1);
  }
}

seed();
