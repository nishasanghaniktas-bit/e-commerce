const jwt = require("jsonwebtoken");
const User = require("../models/User");

/* ================= PROTECT ================= */

exports.protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    console.log("Auth Header:", authHeader ? "Present" : "Missing");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("Auth failure: No bearer token");
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const token = authHeader.split(" ")[1];

    if (!token || token === "undefined" || token === "null") {
      console.log("Auth failure: Token is undefined/null");
      return res.status(401).json({ message: "Not authorized, invalid token" });
    }

    console.log("Token received, verifying...");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Token verified, user ID:", decoded.id);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("Auth failure: User not found in DB");
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user;
    next();

  } catch (error) {
    console.log("Auth failure: JWT Error -", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
};

/* ================= AUTHORIZE ================= */
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }
    next();
  };
};

/* ================= ADMIN ================= */
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({ message: "Admin access required" });
  }
};