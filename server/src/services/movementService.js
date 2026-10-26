import { pool } from "../db/pool.js";

function createNotFoundError() {
  const error = new Error("Product not found");
  error.statusCode = 404;
  return error;
}

function createInsufficientStockError(availableQuantity, requestedQuantity) {
  const error = new Error("Insufficient stock");
  error.statusCode = 409;
  error.details = {
    availableQuantity,
    requestedQuantity,
  };
  return error;
}

function mapMovement(row) {
  return {
    id: row.id,
    productId: row.product_id,
    type: row.type,
    quantity: row.quantity,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function createMovement(productId, { type, quantity, reason }) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    const productResult = await client.query(
      "SELECT * FROM products WHERE id = $1 FOR UPDATE",
      [productId],
    );

    if (productResult.rows.length === 0) {
      throw createNotFoundError();
    }

    const product = productResult.rows[0];
    const currentQuantity = product.quantity;

    if (type === "OUT" && currentQuantity < quantity) {
      throw createInsufficientStockError(currentQuantity, quantity);
    }

    const newQuantity =
      type === "IN" ? currentQuantity + quantity : currentQuantity - quantity;

    await client.query(
      `UPDATE products
          SET quantity = $1, updated_at = NOW()
        WHERE id = $2`,
      [newQuantity, productId],
    );

    const movementResult = await client.query(
      `INSERT INTO inventory_movements (product_id, type, quantity, reason)
       VALUES ($1, $2, $3, $4)
       RETURNING id, product_id, type, quantity, reason, created_at`,
      [productId, type, quantity, reason.trim()],
    );

    await client.query("COMMIT");

    return {
      movement: mapMovement(movementResult.rows[0]),
      newQuantity,
    };
  } catch (error) {
    try {
      await client.query("ROLLBACK");
    } catch (rollbackError) {
      console.error("Failed to rollback inventory movement transaction", rollbackError);
    }

    throw error;
  } finally {
    client.release();
  }
}

function buildMovementFilters({ productId, type } = {}) {
  const values = [];
  const conditions = [];

  if (productId !== undefined) {
    values.push(productId);
    conditions.push(`product_id = $${values.length}`);
  }

  if (type !== undefined) {
    values.push(type);
    conditions.push(`type = $${values.length}`);
  }

  return {
    values,
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
  };
}

export async function getAllMovements(filters = {}) {
  const { values, whereClause } = buildMovementFilters(filters);
  const result = await pool.query(
    `SELECT id, product_id, type, quantity, reason, created_at
       FROM inventory_movements
       ${whereClause}
       ORDER BY created_at DESC`,
    values,
  );

  return result.rows.map(mapMovement);
}

export async function getMovementsByProductId(productId) {
  return getAllMovements({ productId });
}
