export const errorHandler = (error, _req, res, _next) => {
  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    message: error.message || "Internal server error.",
    stack: process.env.NODE_ENV === "production" ? undefined : error.stack,
  });
};
