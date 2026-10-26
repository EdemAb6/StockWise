import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  getProducts,
  updateProduct,
} from "../controllers/productController.js";
import {
  productCreationValidation,
  productUpdateValidation,
} from "../validators/productValidators.js";

const router = Router();

router.get("/", getProducts);
router.get("/:id", getProduct);
router.post("/", productCreationValidation, createProduct);
router.patch("/:id", productUpdateValidation, updateProduct);
router.delete("/:id", deleteProduct);

export default router;
