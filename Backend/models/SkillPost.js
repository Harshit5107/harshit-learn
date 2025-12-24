const mongoose = require("mongoose");

const skillPostSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  type: {
    type: String,
    enum: ["offer", "request"],
    required: true,
  },

  title: {
    type: String,
    required: true,
  },

  skills: [{
    type: String,
    required: true,
  }],

  description: {
    type: String,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("SkillPost", skillPostSchema);
