// controllers/courseController.js
const Course = require("../models/Course");

/* =========================
   CREATE COURSE
========================= */
const createCourse = async (req, res) => {
  try {
    const { title, description, category } = req.body;

    const course = await Course.create({
      title,
      description,
      category,
      skill_provider: req.user.id,
      status: "draft", // always draft initially
    });

    res.status(201).json({
      success: true,
      message: "Course created successfully",
      course,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET ALL COURSES (STUDENT)
========================= */
const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find({ status: "published" })
      .populate("skill_provider", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      courses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* =========================
   GET COURSE BY ID
========================= */
const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("skill_provider", "name email");

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json({ success: true, course });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   PUBLISH COURSE (🔥 FIXED)
========================= */
const publishCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.skill_provider.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // ✅ FORCE publish (no toggle bug)
    course.status = "published";
    await course.save();

    res.json({
      success: true,
      message: "Course published successfully 🚀",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   ENROLL COURSE
========================= */
const enrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const alreadyEnrolled = course.enrolledStudents.some(
      id => id.toString() === req.user.id
    );

    if (alreadyEnrolled) {
      return res.status(400).json({ message: "Already enrolled" });
    }

    course.enrolledStudents.push(req.user.id);

    course.progress.push({
      student: req.user.id,
      value: 0,
    });

    await course.save();
    res.json({ success: true, message: "Enrolled successfully ✅" });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UPDATE PROGRESS
========================= */
const updateProgress = async (req, res) => {
  try {
    const { value } = req.body;
    const userId = req.user.id;

    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const enrolled = course.enrolledStudents.some(
      id => id && id.toString() === userId
    );

    if (!enrolled) {
      return res.status(403).json({ message: "Not enrolled" });
    }

    const safeValue = Math.min(Math.max(Number(value), 0), 100);

    let entry = course.progress.find(
      p => p && p.student && p.student.toString() === userId
    );

    if (entry) {
      if (safeValue > entry.value) {
        entry.value = safeValue;
      }
    } else {
      course.progress.push({
        student: userId,
        value: safeValue,
      });
    }

    if (
      safeValue === 100 &&
      !course.completedStudents.some(
        id => id && id.toString() === userId
      )
    ) {
      course.completedStudents.push(userId);
    }

    course.progress = course.progress.filter(p => p && p.student);

    await course.save();

    res.json({ success: true, progress: safeValue });
  } catch (err) {
    console.error("Progress error:", err);
    res.status(500).json({ message: "Progress update failed" });
  }
};

/* =========================
   MY LEARNING
========================= */
const getMyLearningCourses = async (req, res) => {
  try {
    const userId = req.user.id;

    const courses = await Course.find({
      enrolledStudents: userId,
    });

    const formatted = courses.map(course => {
      const p = course.progress.find(
        pr => pr && pr.student && pr.student.toString() === userId
      );

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        progress: p ? p.value : 0,
      };
    });

    res.json({ courses: formatted });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

/* =========================
   UNENROLL
========================= */
const unenrollCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ message: "Course not found" });

    course.enrolledStudents = course.enrolledStudents.filter(
      id => id.toString() !== req.user.id
    );

    course.progress = course.progress.filter(
      p => p.student.toString() !== req.user.id
    );

    course.completedStudents = course.completedStudents.filter(
      id => id.toString() !== req.user.id
    );

    await course.save();
    res.json({ success: true, message: "Unenrolled successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* =========================
   DELETE COURSE (Skill Provider)
========================= */
const deleteCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);

    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found"
      });
    }

    // 🔒 Only creator can delete
    if (course.skill_provider.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this course"
      });
    }

    await course.deleteOne();

    res.json({
      success: true,
      message: "Course deleted successfully ✅"
    });

  } catch (error) {
    console.error("Delete course error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  publishCourse,
  enrollCourse,
  unenrollCourse,
  updateProgress,
  getMyLearningCourses,
  deleteCourse,
};
