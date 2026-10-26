function validateMovementFields(body) {
  const errors = [];

  if (body.type !== "IN" && body.type !== "OUT") {
    errors.push({
      field: "type",
      message: "Type must be either IN or OUT",
    });
  }

  if (!Number.isInteger(body.quantity) || body.quantity <= 0) {
    errors.push({
      field: "quantity",
      message: "Quantity must be a positive integer",
    });
  }

  if (typeof body.reason !== "string" || body.reason.trim().length === 0) {
    errors.push({
      field: "reason",
      message: "Reason must be a non-empty string",
    });
  }

  return errors;
}

export function validateMovement(body) {
  return validateMovementFields(body);
}

export function movementValidation(request, _response, next) {
  const errors = validateMovementFields(request.body || {});

  if (errors.length > 0) {
    const error = new Error("Validation failed");
    error.statusCode = 400;
    error.details = errors;
    next(error);
    return;
  }

  next();
}
