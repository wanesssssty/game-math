function errorHandler(err, _req, res, _next) {
  const statusCode = err.statusCode || 500;
  const isOperational = statusCode >= 400 && statusCode < 500;

  if (!isOperational) {
    console.error("Unhandled server error:", err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message || "Internal Server Error",
      details: err.details || null,
    },
  });
}

module.exports = { errorHandler };
