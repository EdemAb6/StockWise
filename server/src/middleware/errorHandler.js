export function notFoundHandler(_request, response) {
  response.status(404).json({ error: "Route not found" });
}

export function errorHandler(error, _request, response, _next) {
  if (error.code === "23505") {
    response
      .status(409)
      .json({ error: "A product with this SKU already exists." });
    return;
  }

  const statusCode = Number.isInteger(error.statusCode)
    ? error.statusCode
    : Number.isInteger(error.status)
      ? error.status
      : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  response.status(statusCode >= 400 && statusCode < 600 ? statusCode : 500).json({
    error: error.message || "Internal server error",
    ...(error.details && error.statusCode === 409 && error.message === "Insufficient stock"
      ? error.details
      : {}),
    ...(error.details && !(error.statusCode === 409 && error.message === "Insufficient stock")
      ? { details: error.details }
      : {}),
  });
}
