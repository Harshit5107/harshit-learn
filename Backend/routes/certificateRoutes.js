// routes/certificateRoutes.js
const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { getCertificateData } = require("../controllers/certificateController");

// FINAL & ONLY ROUTE
router.get(
  "/certificates/:courseId",
  protect,
  getCertificateData
);

module.exports = router;
