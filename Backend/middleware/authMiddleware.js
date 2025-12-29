const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🔥 FIX: include BOTH id and role from JWT
    req.user = {
      id: decoded.id || decoded._id || decoded.userId,
      role: decoded.role, // ✅ THIS WAS THE MISSING PIECE
    };

    if (!req.user.id) {
      console.error("JWT payload missing user id:", decoded);
      return res.status(401).json({ message: "Invalid token payload" });
    }

    if (!req.user.role) {
      console.error("JWT payload missing role:", decoded);
      return res.status(403).json({ message: "User role missing in token" });
    }

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };
