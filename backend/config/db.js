// This file's only job: open one connection to MongoDB and hand back a promise
// that server.js can await before it starts accepting requests.

const mongoose = require("mongoose");

async function connectDB() {
  try {
    // mongoose.connect returns a promise that resolves once the socket to
    // MongoDB Atlas (or your local mongod) is actually open.
    const conn = await mongoose.connect(process.env.MONGO_URI);

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // If the URI is wrong, the password has a typo, or your IP isn't
    // whitelisted in Atlas, this is where you'll see it.
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1); // stop the whole app — there's no point running an API with no DB
  }
}

module.exports = connectDB;
