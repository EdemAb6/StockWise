import { getDashboardStats } from "../services/dashboardService.js";

export async function getDashboardStatsController(_request, response, next) {
  try {
    const stats = await getDashboardStats();
    response.status(200).json(stats);
  } catch (error) {
    next(error);
  }
}
