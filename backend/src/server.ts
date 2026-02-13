import express from "express";
import dotenv from "dotenv";
dotenv.config();

import {pool} from "./db/pool.js";
import healthRoutes from "./modules/health/health.routes.js"

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());


pool.connect()
    .then(() => {
      console.log("Forbundet til PostgreSQL");
    })
    .catch((err: Error) => {
      console.error("Kunne ikke forbinde til DB ", err);
    });

app.use("/health", healthRoutes);
app.listen(port, () => {
  console.log(`Backend kører på http://localhost:${port}`);
});
