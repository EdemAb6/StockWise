import * as productService from "../services/productService.js";

export async function getProducts(request, response, next) {
  try {
    const products = await productService.getAllProducts(request.query);
    response.status(200).json(products);
  } catch (error) {
    next(error);
  }
}

export async function getProduct(request, response, next) {
  try {
    const product = await productService.getProductById(request.params.id);
    response.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

export async function createProduct(request, response, next) {
  try {
    const product = await productService.createProduct(request.body);
    response.status(201).json(product);
  } catch (error) {
    next(error);
  }
}

export async function updateProduct(request, response, next) {
  try {
    const product = await productService.updateProduct(request.params.id, request.body);
    response.status(200).json(product);
  } catch (error) {
    next(error);
  }
}

export async function deleteProduct(request, response, next) {
  try {
    await productService.deleteProduct(request.params.id);
    response.status(204).send();
  } catch (error) {
    next(error);
  }
}
