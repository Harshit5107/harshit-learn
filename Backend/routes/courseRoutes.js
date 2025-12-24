const express = require("express");
const router = express.Router();

const {
  createCourse,
  getAllCourses,
  getCourseById,
  publishCourse,
  enrollCourse,
  unenrollCourse,
  updateProgress,
  getMyLearningCourses,
  deleteCourse
} = require("../controllers/courseController");

const { protect } = require("../middleware/authMiddleware");
const { isSkillProvider } = require("../middleware/skill_providerMiddleware");

/* ================================
   🔥 MY LEARNING (STUDENT)
================================ */
router.get("/my-learning", protect, getMyLearningCourses);

/* ================================
   🧑‍🏫 SKILL PROVIDER
================================ */
router.post("/", protect, isSkillProvider, createCourse);
router.put("/:id/publish", protect, isSkillProvider, publishCourse);

// ✅ DELETE COURSE (Skill Provider only)
router.delete("/:id", protect, isSkillProvider, deleteCourse);

/* ================================
   🎓 STUDENT
================================ */
router.post("/:id/enroll", protect, enrollCourse);
router.post("/:id/unenroll", protect, unenrollCourse);
router.post("/:id/progress", protect, updateProgress);

/* ================================
   🌍 PUBLIC
================================ */
router.get("/", getAllCourses);
router.get("/:id", getCourseById);

module.exports = router;
