const express = require("express");
const router = express.Router();

const { createSkillPost, getSkillPosts } = require("../controllers/skillController");
const { protect } = require("../middleware/authMiddleware");

router.post("/", protect, createSkillPost);
router.get("/", getSkillPosts);

module.exports = router;
