const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },

  password: {
    type: String,
    required: true
  },

  // 🔥 FIXED ROLE (lowercase everywhere)
  role: {
    type: String,
    enum: ["student", "mentor", "skill_provider"],
    default: "student"
  },

  skills: {
    type: [String],
    default: []   // ✅ prevents validation crash
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("User", userSchema);
