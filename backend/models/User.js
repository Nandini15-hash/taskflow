// Defines what a "user" document looks like in MongoDB, plus two helper
// methods attached to every user we load: one to hash a password before
// saving, one to check a password at login time.

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true, // Mongoose + MongoDB will reject a second user with the same email
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // by default, queries won't return the hashed password at all
    },
  },
  { timestamps: true } // adds createdAt / updatedAt automatically
);

// Mongoose "pre-save" hook: this runs automatically right before a user
// document is written to the DB, every time .save() is called.
userSchema.pre("save", async function (next) {
  // Only re-hash the password if it was actually changed (e.g. don't
  // re-hash it every time the user updates their name).
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method: usable as `user.comparePassword(plainTextPassword)`.
// bcrypt.compare hashes the candidate the same way and checks it matches.
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
