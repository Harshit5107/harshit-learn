const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMe,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

// 🔹 Register
router.post("/register", registerUser);

// 🔹 Login
router.post("/login", loginUser);

// 🔹 Get logged-in user (role + skills from MongoDB)
router.get("/me", protect, getMe);

module.exports = router;
