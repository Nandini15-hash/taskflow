// This file's only job: open one connection to MongoDB and hand back a promise
// that server.js can await before it starts accepting requests.

const mongoose = require("mongoose");

let isConnected = false;

async function connectDB() {
  // On Vercel, a serverless function's module scope can be reused across
  // invocations (a "warm" instance) — this skips reconnecting when that
  // happens instead of opening a new connection on every request.
  if (isConnected) return;

  try {
    // mongoose.connect returns a promise that resolves once the socket to
    // MongoDB Atlas (or your local mongod) is actually open.
    const conn = await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;

    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    // If the URI is wrong, the password has a typo, or your IP isn't
    // whitelisted in Atlas, this is where you'll see it.
    console.error(`MongoDB connection error: ${error.message}`);
    // Note: no process.exit(1) here anymore. In a serverless function,
    // exiting the process would crash the whole function on every cold
    // start instead of just failing this one request — so instead we
    // throw and let the request that triggered this fail on its own.
    throw error;
  }
}

module.exports = connectDB;
