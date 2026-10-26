import { Router } from "express";
import {
  createMovement,
  getMovements,
  getProductMovements,
} from "../controllers/movementController.js";
import { movementValidation } from "../validators/movementValidators.js";

const router = Router();

router.post(
  "/products/:id/movements",
  movementValidation,
  createMovement,
);
router.get("/movements", getMovements);
router.get("/products/:id/movements", getProductMovements);

export default router;
