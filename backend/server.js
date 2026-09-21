// Entry point. Wires together: env vars -> DB connection -> middleware ->
// routes -> error handler -> start listening.

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const taskRoutes = require("./routes/taskRoutes");
const errorHandler = require("./middleware/errorHandler");

connectDB(); // fire-and-forget here; connectDB itself exits the process on failure

const app = express();

app.use(cors()); // lets the Vite dev server (a different port) call this API
app.use(express.json()); // parses incoming JSON bodies into req.body

// Quick manual check: GET http://localhost:5000/api/health
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

// Must be registered LAST — Express only treats a 4-argument function as
// an error handler, and it only catches errors from routes defined above it.
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`TaskFlow API listening on http://localhost:${PORT}`);
});
