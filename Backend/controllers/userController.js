const User = require("../models/User");
const Course = require("../models/Course");

/**
 * ===============================
 * 🔹 UPDATE USER ROLE (MongoDB)
 * ===============================
 */
const updateRole = async (req, res) => {
  try {
    let { role } = req.body;

    if (!role) {
      return res.status(400).json({
        success: false,
        message: "Role is required",
      });
    }

    // 🔸 Normalize role values (IMPORTANT)
    role = role.toLowerCase();

    if (role === "skill provider" || role === "skill_provider") {
      role = "skill_provider";
    } else if (role === "student") {
      role = "Student";
    } else if (role === "mentor") {
      role = "Mentor";
    } else {
      return res.status(400).json({
        success: false,
        message: "Invalid role value",
      });
    }

    // 🔥 SAVE TO MONGODB
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { role },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Role updated successfully ✅",
      user,
    });
  } catch (error) {
    console.error("ROLE UPDATE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Role update failed",
    });
  }
};

/**
 * ===============================
 * 🔹 ADD USER SKILLS (MongoDB)
 * ===============================
 */
const addSkills = async (req, res) => {
  try {
    let { skills } = req.body;

    // allow string OR array
    if (typeof skills === "string") {
      skills = skills.split(",").map(s => s.trim()).filter(Boolean);
    }

    if (!Array.isArray(skills)) {
      return res.status(400).json({
        success: false,
        message: "Skills must be an array",
      });
    }

    // 🔥 SAVE TO MONGODB (NO DUPLICATES)
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $addToSet: { skills: { $each: skills } } },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.json({
      success: true,
      message: "Skills updated successfully ✅",
      user,
    });
  } catch (error) {
    console.error("ADD SKILLS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Skill update failed",
    });
  }
};

/**
 * ===============================
 * 🔹 GET MY COURSES
 * ===============================
 */
const getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({
      "enrolledStudents.user": req.user.id,
    }).select("title description enrolledStudents");

    const myCourses = courses.map((course) => {
      const studentData = course.enrolledStudents.find(
        (s) => s.user.toString() === req.user.id.toString()
      );

      return {
        _id: course._id,
        title: course.title,
        description: course.description,
        progress: studentData?.progress || 0,
        completed: studentData?.completed || false,
      };
    });

    res.json({
      success: true,
      courses: myCourses,
    });
  } catch (error) {
    console.error("GET MY COURSES ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch courses",
    });
  }
};

module.exports = {
  updateRole,
  addSkills,
  getMyCourses,
};
