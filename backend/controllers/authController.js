const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Small helper: builds a signed JWT that encodes the user's id and expires
// in 30 days. jwt.sign(payload, secret, options).
function generateToken(userId) {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
}

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are all required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "An account with that email already exists" });
    }

    // Note: we pass the plain password in here. The pre-save hook in
    // User.js hashes it automatically before it ever touches the DB.
    const user = await User.create({ name, email, password });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error); // hands off to errorHandler.js
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // .select("+password") overrides the schema's `select: false` just for
    // this one query, because we need the hash to compare against.
    const user = await User.findOne({ email }).select("+password");

    // Deliberately vague on which part was wrong (email vs password) —
    // this is a small security habit: it stops attackers from using the
    // error message to figure out which emails are registered.
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
}

// GET /api/auth/me  (protected — used by the frontend to restore a session on page refresh)
async function getMe(req, res) {
  res.json(req.user);
}

module.exports = { register, login, getMe };
