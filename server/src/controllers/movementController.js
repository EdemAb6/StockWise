import * as movementService from "../services/movementService.js";

export async function createMovement(request, response, next) {
  try {
    const result = await movementService.createMovement(
      request.params.id,
      request.body,
    );
    response.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getMovements(request, response, next) {
  try {
    const movements = await movementService.getAllMovements(request.query);
    response.status(200).json(movements);
  } catch (error) {
    next(error);
  }
}

export async function getProductMovements(request, response, next) {
  try {
    const movements = await movementService.getMovementsByProductId(
      request.params.id,
    );
    response.status(200).json(movements);
  } catch (error) {
    next(error);
  }
}
