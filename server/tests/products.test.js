import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import { app } from "../src/app.js";
import * as productService from "../src/services/productService.js";

vi.mock("../src/services/productService.js", () => ({
  createProduct: vi.fn(),
  deleteProduct: vi.fn(),
  getAllProducts: vi.fn(),
  getProductById: vi.fn(),
  updateProduct: vi.fn(),
}));

const product = {
  id: 1,
  name: "Wireless Keyboard",
  sku: "KB-001",
  description: "Compact wireless keyboard",
  category: "Accessories",
  price: 35.99,
  quantity: 24,
  minimumStock: 5,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("product API", () => {
  it("creates a valid product", async () => {
    productService.createProduct.mockResolvedValue(product);

    const response = await request(app).post("/api/products").send(product);

    expect(response.status).toBe(201);
    expect(response.body).toEqual(product);
    expect(productService.createProduct).toHaveBeenCalledWith(product);
  });

  it("rejects negative price and quantity", async () => {
    const response = await request(app).post("/api/products").send({
      ...product,
      price: -1,
      quantity: -2,
    });

    expect(response.status).toBe(400);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "price" }),
        expect.objectContaining({ field: "quantity" }),
      ]),
    );
    expect(productService.createProduct).not.toHaveBeenCalled();
  });

  it("rejects duplicate SKUs with 409", async () => {
    productService.createProduct.mockRejectedValue({ code: "23505" });

    const response = await request(app).post("/api/products").send(product);

    expect(response.status).toBe(409);
    expect(response.body.error).toBe("A product with this SKU already exists.");
  });

  it("lists, searches, and filters products", async () => {
    productService.getAllProducts.mockResolvedValue([product]);

    const response = await request(app)
      .get("/api/products")
      .query({ search: "keyboard", category: "Accessories", stockStatus: "low" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([product]);
    expect(productService.getAllProducts).toHaveBeenCalledWith({
      search: "keyboard",
      category: "Accessories",
      stockStatus: "low",
    });
  });

  it("retrieves a product", async () => {
    productService.getProductById.mockResolvedValue(product);

    const response = await request(app).get("/api/products/1");

    expect(response.status).toBe(200);
    expect(response.body).toEqual(product);
  });

  it("updates product metadata", async () => {
    const updatedProduct = { ...product, name: "Updated Keyboard" };
    productService.updateProduct.mockResolvedValue(updatedProduct);

    const response = await request(app)
      .patch("/api/products/1")
      .send({ name: "Updated Keyboard" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(updatedProduct);
    expect(productService.updateProduct).toHaveBeenCalledWith("1", {
      name: "Updated Keyboard",
    });
  });

  it("rejects direct quantity updates", async () => {
    const response = await request(app)
      .patch("/api/products/1")
      .send({ quantity: 10 });

    expect(response.status).toBe(400);
    expect(response.body.details[0]).toEqual({
      field: "quantity",
      message: "Quantity changes must be made through inventory movements",
    });
  });

  it("deletes a product", async () => {
    productService.deleteProduct.mockResolvedValue(undefined);

    const response = await request(app).delete("/api/products/1");

    expect(response.status).toBe(204);
    expect(response.body).toEqual({});
    expect(productService.deleteProduct).toHaveBeenCalledWith("1");
  });
});
