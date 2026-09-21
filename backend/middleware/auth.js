// This middleware sits in front of any route we want to protect.
// It checks for a valid JWT in the Authorization header, and if the token
// is good, it attaches the matching user to `req.user` so later route
// handlers can trust "req.user is whoever is logged in".

const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  let token;

  // The frontend is expected to send: Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    token = authHeader.split(" ")[1]; // "Bearer abc123" -> "abc123"
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }

  try {
    // jwt.verify throws if the token is expired, malformed, or was signed
    // with a different secret than JWT_SECRET.
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // decoded.id was put there when we created the token at login (see
    // authController.js). We look the user up fresh from the DB rather
    // than trusting the token's contents blindly.
    req.user = await User.findById(decoded.id);

    if (!req.user) {
      return res.status(401).json({ message: "User for this token no longer exists" });
    }

    next(); // hand off to the actual route handler
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token invalid or expired" });
  }
}

module.exports = { protect };
