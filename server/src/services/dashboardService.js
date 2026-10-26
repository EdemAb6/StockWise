import { pool } from "../db/pool.js";

function mapMovement(row) {
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    sku: row.sku,
    type: row.type,
    quantity: row.quantity,
    reason: row.reason,
    createdAt: row.created_at,
  };
}

export async function getDashboardStats() {
  const [productStats, lowStockStats, recentMovements] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*)::integer AS total_products,
        COALESCE(SUM(price * quantity), 0)::numeric AS total_inventory_value
      FROM products
    `),
    pool.query(`
      SELECT COUNT(*)::integer AS low_stock_products
      FROM products
      WHERE quantity <= minimum_stock
    `),
    pool.query(`
      SELECT
        inventory_movements.id,
        inventory_movements.product_id,
        products.name AS product_name,
        products.sku,
        inventory_movements.type,
        inventory_movements.quantity,
        inventory_movements.reason,
        inventory_movements.created_at
      FROM inventory_movements
      INNER JOIN products ON products.id = inventory_movements.product_id
      ORDER BY inventory_movements.created_at DESC
      LIMIT 5
    `),
  ]);

  const stats = productStats.rows[0];
  return {
    totalProducts: stats.total_products,
    totalInventoryValue: Number(stats.total_inventory_value),
    lowStockProducts: lowStockStats.rows[0].low_stock_products,
    recentMovements: recentMovements.rows.map(mapMovement),
  };
}
