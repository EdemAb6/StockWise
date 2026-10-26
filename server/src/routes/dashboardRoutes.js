import { Router } from "express";
import { getDashboardStatsController } from "../controllers/dashboardController.js";

const router = Router();

router.get("/", getDashboardStatsController);
router.get("/stats", getDashboardStatsController);

export default router;
