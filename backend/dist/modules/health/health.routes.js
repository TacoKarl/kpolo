import { Router } from 'express';
import { pool } from "../../db/pool.js";
const router = Router();
router.get("/", (req, res) => {
    res.json({ status: "ok" });
});
router.get("/ready", async (req, res) => {
    try {
        const result = await pool.query("SELECT NOW()");
        res.json({
            message: "Database virker!",
            time: result.rows[0],
        });
    }
    catch (error) {
        res.status(500).json({ error: "DB fejl", details: error });
    }
});
export default router;
//# sourceMappingURL=health.routes.js.map