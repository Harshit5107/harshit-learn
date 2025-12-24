const SkillPost = require("../models/SkillPost");

// Create skill post
exports.createSkillPost = async (req, res) => {
  try {
    const { type, title, skills, description } = req.body;

    const post = await SkillPost.create({
      user: req.user.id,
      type,
      title,
      skills,
      description,
    });

    res.status(201).json({ success: true, post });
  } catch (error) {
    res.status(500).json({ message: "Failed to create skill post" });
  }
};

// Get all skill posts
exports.getSkillPosts = async (req, res) => {
  try {
    const posts = await SkillPost.find().populate("user", "name role");

    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch posts" });
  }
};
