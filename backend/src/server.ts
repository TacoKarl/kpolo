import express from "express";
import dotenv from "dotenv";
import {Pool} from "pg";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

pool.connect()
    .then(() => {
      console.log("Forbundet til PostgreSQL");
    })
    .catch((err) => {
      console.error("Kunne ikke forbinde til DB ", err);
    });
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      message: "Database virker!",
      time: result.rows[0],
    });
  } catch (error) {
    res.status(500).json({ error: "DB fejl", details: error });
  }
});

app.listen(port, () => {
  console.log(`Backend kører på http://localhost:${port}`);
});
