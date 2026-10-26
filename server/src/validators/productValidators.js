function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isNonNegativeNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0;
}

function isNonNegativeInteger(value) {
  return Number.isInteger(value) && value >= 0;
}

function validateProductFields(body, { partial }) {
  const errors = [];
  const requiredFields = ["name", "sku", "category", "price", "quantity", "minimumStock"];

  if (!partial) {
    for (const field of requiredFields) {
      if (body[field] === undefined || body[field] === null) {
        errors.push({ field, message: `${field} is required` });
      }
    }
  }

  if (body.name !== undefined && !isNonEmptyString(body.name)) {
    errors.push({ field: "name", message: "Name must be a non-empty string" });
  }

  if (body.sku !== undefined && !isNonEmptyString(body.sku)) {
    errors.push({ field: "sku", message: "SKU must be a non-empty string" });
  }

  if (body.category !== undefined && !isNonEmptyString(body.category)) {
    errors.push({ field: "category", message: "Category must be a non-empty string" });
  }

  if (body.description !== undefined && body.description !== null &&
      typeof body.description !== "string") {
    errors.push({ field: "description", message: "Description must be a string" });
  }

  if (body.price !== undefined && !isNonNegativeNumber(body.price)) {
    errors.push({ field: "price", message: "Price must be a number greater than or equal to 0" });
  }

  if (body.quantity !== undefined && !isNonNegativeInteger(body.quantity)) {
    errors.push({
      field: "quantity",
      message: "Quantity must be a non-negative integer",
    });
  }

  if (body.minimumStock !== undefined && !isNonNegativeInteger(body.minimumStock)) {
    errors.push({
      field: "minimumStock",
      message: "Minimum stock must be a non-negative integer",
    });
  }

  return errors;
}

function validationMiddleware(validate) {
  return (request, _response, next) => {
    const errors = validate(request.body || {});

    if (errors.length > 0) {
      const error = new Error("Validation failed");
      error.statusCode = 400;
      error.details = errors;
      next(error);
      return;
    }

    next();
  };
}

export function validateProductCreation(body) {
  return validateProductFields(body, { partial: false });
}

export function validateProductUpdate(body) {
  const errors = validateProductFields(body, { partial: true });

  if (Object.prototype.hasOwnProperty.call(body, "quantity")) {
    errors.push({
      field: "quantity",
      message: "Quantity changes must be made through inventory movements",
    });
  }

  if (Object.keys(body).length === 0) {
    errors.push({
      field: "body",
      message: "At least one product field is required",
    });
  }

  return errors;
}

export const productCreationValidation = validationMiddleware(validateProductCreation);
export const productUpdateValidation = validationMiddleware(validateProductUpdate);
