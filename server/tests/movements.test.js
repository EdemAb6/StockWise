import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

const mockClient = {
  query: vi.fn(),
  release: vi.fn(),
};

const mockPool = {
  connect: vi.fn(),
  query: vi.fn(),
};

vi.mock("../src/db/pool.js", () => ({
  pool: mockPool,
}));

const { app } = await import("../src/app.js");
const { createMovement, getAllMovements, getMovementsByProductId } =
  await import("../src/services/movementService.js");

beforeEach(() => {
  vi.clearAllMocks();
  mockPool.connect.mockResolvedValue(mockClient);
  mockClient.query.mockReset();
  mockClient.release.mockReset();
});

describe("movement API", () => {
  it("creates an IN movement and increases stock", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, quantity: 10 }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{
          id: 20,
          product_id: 1,
          type: "IN",
          quantity: 5,
          reason: "Supplier delivery",
          created_at: "2026-10-25T10:00:00.000Z",
        }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post("/api/products/1/movements")
      .send({ type: "IN", quantity: 5, reason: "Supplier delivery" });

    expect(response.status).toBe(201);
    expect(response.body.newQuantity).toBe(15);
    expect(response.body.movement).toMatchObject({
      productId: 1,
      type: "IN",
      quantity: 5,
    });
    expect(mockClient.query.mock.calls.map(([query]) => query)).toEqual([
      "BEGIN",
      "SELECT * FROM products WHERE id = $1 FOR UPDATE",
      expect.stringContaining("UPDATE products"),
      expect.stringContaining("INSERT INTO inventory_movements"),
      "COMMIT",
    ]);
  });

  it("creates an OUT movement and decreases stock", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, quantity: 10 }] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({
        rows: [{
          id: 21,
          product_id: 1,
          type: "OUT",
          quantity: 4,
          reason: "Customer order",
          created_at: "2026-10-25T10:00:00.000Z",
        }],
      })
      .mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post("/api/products/1/movements")
      .send({ type: "OUT", quantity: 4, reason: "Customer order" });

    expect(response.status).toBe(201);
    expect(response.body.newQuantity).toBe(6);
  });

  it("rejects insufficient stock and keeps quantity unchanged", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [{ id: 1, quantity: 3 }] })
      .mockResolvedValueOnce({ rows: [] });

    const response = await request(app)
      .post("/api/products/1/movements")
      .send({ type: "OUT", quantity: 4, reason: "Customer order" });

    expect(response.status).toBe(409);
    expect(response.body).toEqual({
      error: "Insufficient stock",
      availableQuantity: 3,
      requestedQuantity: 4,
    });
    expect(mockClient.query).toHaveBeenCalledWith("ROLLBACK");
    expect(mockClient.query).not.toHaveBeenCalledWith(
      expect.stringContaining("UPDATE products"),
      expect.anything(),
    );
  });

  it("rejects invalid movement data", async () => {
    const response = await request(app)
      .post("/api/products/1/movements")
      .send({ type: "INVALID", quantity: -1, reason: " " });

    expect(response.status).toBe(400);
    expect(response.body.details).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ field: "type" }),
        expect.objectContaining({ field: "quantity" }),
        expect.objectContaining({ field: "reason" }),
      ]),
    );
    expect(mockPool.connect).not.toHaveBeenCalled();
  });

  it("retrieves filtered movement lists", async () => {
    const databaseMovements = [{
      id: 1,
      product_id: 1,
      type: "OUT",
      quantity: 2,
      reason: "Order",
    }];
    mockPool.query.mockResolvedValue({ rows: databaseMovements });

    const response = await request(app)
      .get("/api/movements")
      .query({ productId: "1", type: "OUT" });

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      id: 1,
      productId: 1,
      type: "OUT",
      quantity: 2,
      reason: "Order",
    }]);
    expect(mockPool.query).toHaveBeenCalledWith(
      expect.stringContaining("ORDER BY created_at DESC"),
      ["1", "OUT"],
    );
  });

  it("retrieves movement history for a product", async () => {
    mockPool.query.mockResolvedValue({
      rows: [{ id: 1, product_id: 1, type: "IN", quantity: 5 }],
    });

    const response = await request(app).get("/api/products/1/movements");

    expect(response.status).toBe(200);
    expect(response.body).toEqual([{
      id: 1,
      productId: 1,
      type: "IN",
      quantity: 5,
    }]);
  });
});

describe("movement service transactions", () => {
  it("rolls back and releases the client when a database error occurs", async () => {
    mockClient.query
      .mockResolvedValueOnce({ rows: [] })
      .mockRejectedValueOnce(new Error("database unavailable"))
      .mockResolvedValueOnce({ rows: [] });

    await expect(
      createMovement("1", {
        type: "IN",
        quantity: 5,
        reason: "Delivery",
      }),
    ).rejects.toThrow("database unavailable");

    expect(mockClient.query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(mockClient.query).toHaveBeenNthCalledWith(3, "ROLLBACK");
    expect(mockClient.release).toHaveBeenCalledOnce();
  });
});
