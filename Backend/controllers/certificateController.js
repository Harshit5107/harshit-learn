// controllers/certificateController.js
const Certificate = require("../models/Certificate");
const Course = require("../models/Course");
const User = require("../models/User");

exports.getCertificateData = async (req, res) => {
  try {
    // 🔐 logged-in user from auth middleware
    const userId = req.user.id;
    const { courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({ message: "Missing userId or courseId" });
    }

    // fetch user + course
    const user = await User.findById(userId).select("name email");
    const course = await Course.findById(courseId).select("title");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    // find or create certificate
    let certificate = await Certificate.findOne({
      user: userId,
      course: courseId,
    });

    if (!certificate) {
      certificate = await Certificate.create({
        user: userId,
        course: courseId,
        certificateId: `HL-${Date.now()}`,
        issuedAt: new Date(),
      });
    }

    // ✅ FINAL RESPONSE (frontend-friendly)
    res.status(200).json({
      user: {
        name: user.name, // 🔥 THIS is the logged-in user's name
        email: user.email,
      },
      course: {
        title: course.title,
      },
      certificateId: certificate.certificateId,
      issuedAt: certificate.issuedAt,
    });

  } catch (err) {
    console.error("Get certificate failed:", err);
    res.status(500).json({ message: "Failed to fetch certificate data" });
  }
};
