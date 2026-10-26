import { Router } from "express";
import { pool } from "../db/pool.js";

const router = Router();

router.get("/", async (_request, response, next) => {
  try {
    await pool.query("SELECT 1");
    response.json({
      status: "ok",
      database: "connected",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    next(error);
  }
});

export default router;
