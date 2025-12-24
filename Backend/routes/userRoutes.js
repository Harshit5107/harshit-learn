// routes/userRoutes.js
const express = require("express");
const router = express.Router();

const {
  updateRole,
  addSkills,
  getMyCourses,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");

router.put("/role", protect, updateRole);
router.put("/skills", protect, addSkills);
router.get("/my-courses", protect, getMyCourses);

module.exports = router;
