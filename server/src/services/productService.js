import { pool } from "../db/pool.js";

function createNotFoundError() {
  const error = new Error("Product not found");
  error.statusCode = 404;
  return error;
}

function mapProduct(row) {
  return {
    id: row.id,
    name: row.name,
    sku: row.sku,
    description: row.description,
    category: row.category,
    price: Number(row.price),
    quantity: row.quantity,
    minimumStock: row.minimum_stock,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function getAllProducts({ search, category, stockStatus } = {}) {
  const values = [];
  const conditions = [];

  if (search) {
    values.push(`%${search}%`);
    conditions.push(`(name ILIKE $${values.length} OR sku ILIKE $${values.length})`);
  }

  if (category) {
    values.push(category);
    conditions.push(`category = $${values.length}`);
  }

  if (stockStatus === "low") {
    conditions.push("quantity <= minimum_stock");
  } else if (stockStatus === "normal") {
    conditions.push("quantity > minimum_stock");
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const result = await pool.query(
    `SELECT id, name, sku, description, category, price, quantity,
            minimum_stock, created_at, updated_at
       FROM products
       ${whereClause}
       ORDER BY created_at DESC`,
    values,
  );

  return result.rows.map(mapProduct);
}

export async function getProductById(id) {
  const result = await pool.query(
    `SELECT id, name, sku, description, category, price, quantity,
            minimum_stock, created_at, updated_at
       FROM products
      WHERE id = $1`,
    [id],
  );

  if (result.rows.length === 0) {
    throw createNotFoundError();
  }

  return mapProduct(result.rows[0]);
}

export async function createProduct(data) {
  const result = await pool.query(
    `INSERT INTO products
       (name, sku, description, category, price, quantity, minimum_stock)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, name, sku, description, category, price, quantity,
               minimum_stock, created_at, updated_at`,
    [
      data.name.trim(),
      data.sku.trim(),
      data.description ?? null,
      data.category.trim(),
      data.price,
      data.quantity,
      data.minimumStock,
    ],
  );

  return mapProduct(result.rows[0]);
}

export async function updateProduct(id, data) {
  const fields = [];
  const values = [];
  const fieldMap = {
    name: "name",
    sku: "sku",
    description: "description",
    category: "category",
    price: "price",
    minimumStock: "minimum_stock",
  };

  for (const [inputField, column] of Object.entries(fieldMap)) {
    if (data[inputField] !== undefined) {
      values.push(
        ["name", "sku", "category"].includes(inputField)
          ? data[inputField].trim()
          : data[inputField],
      );
      fields.push(`${column} = $${values.length}`);
    }
  }

  values.push(id);
  const result = await pool.query(
    `UPDATE products
        SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${values.length}
      RETURNING id, name, sku, description, category, price, quantity,
                minimum_stock, created_at, updated_at`,
    values,
  );

  if (result.rows.length === 0) {
    throw createNotFoundError();
  }

  return mapProduct(result.rows[0]);
}

export async function deleteProduct(id) {
  const result = await pool.query("DELETE FROM products WHERE id = $1", [id]);

  if (result.rowCount === 0) {
    throw createNotFoundError();
  }
}
