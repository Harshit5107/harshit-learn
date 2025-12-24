const jwt = require("jsonwebtoken");

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("AUTH HEADER:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED TOKEN:", decoded);

    // ✅ FIX: support all common JWT payload formats
    req.user = {
      id: decoded.id || decoded._id || decoded.userId
    };

    if (!req.user.id) {
      console.error("JWT does not contain user id");
      return res.status(401).json({ message: "Invalid token payload" });
    }

    next();
  } catch (error) {
    console.error("AUTH MIDDLEWARE ERROR:", error.message);
    return res.status(401).json({ message: "Token invalid or expired" });
  }
};

module.exports = { protect };
