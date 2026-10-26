import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import healthRoutes from "./routes/healthRoutes.js";
import movementRoutes from "./routes/movementRoutes.js";
import productRoutes from "./routes/productRoutes.js";

export const app = express();

app.use(cors({ origin: env.clientOrigin }));
app.use(express.json());

app.use("/api/health", healthRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/products", productRoutes);
app.use("/api", movementRoutes);

app.use(notFoundHandler);
app.use(errorHandler);
