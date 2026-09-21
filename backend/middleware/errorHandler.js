// A single place that turns any thrown error into a consistent JSON
// response, instead of every controller writing its own try/catch shape.
// Express recognizes this as an error handler because it takes 4 arguments.
function errorHandler(err, req, res, next) {
  console.error(err.stack);

  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;

  res.status(statusCode).json({
    message: err.message || "Server error",
    // Only leak the stack trace in development, never in production.
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  });
}

module.exports = errorHandler;
