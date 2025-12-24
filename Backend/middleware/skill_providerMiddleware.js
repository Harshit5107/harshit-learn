const isSkillProvider = (req, res, next) => {
  if (req.user && req.user.role === "skill_provider") {
    return next();
  }

  return res.status(403).json({
    message: "Access denied. Skill Provider only.",
  });
};

module.exports = { isSkillProvider };
