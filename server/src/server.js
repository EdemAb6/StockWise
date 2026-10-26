import { app } from "./app.js";
import { env } from "./config/env.js";

app.listen(env.port, () => {
  console.log(`StockWise API listening on port ${env.port}`);
});
