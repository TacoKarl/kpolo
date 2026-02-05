import express from "express";

const app = express();
const port = process.env.PORT || 3000;
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.listen(port, () => {
  console.log(`Backend kører på http://localhost:${port}`);
});
