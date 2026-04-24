// config/db.js
// PURPOSE: Centralise the MongoDB connection so server.js stays clean.
// If the connection fails, we log the error and exit immediately
// (no point running the server without a database).

const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📦 Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    process.exit(1); // Exit process with failure code
  }
};

module.exports = connectDB;
