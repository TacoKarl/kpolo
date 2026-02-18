import {Router} from "express";
import {pool} from "../../db/pool.js";

const router = Router();

router.get("/:id/matches", async (request, response) => {
    const { id } = request.params;

    try {
        const result = await pool.query(
            `SELECT 
                match_number AS number,
                pitch,
                start_time AS starttid,
                away_team AS hold1,
                home_team AS hold2,
                result AS resultat,
                league AS liga
            FROM matches
            WHERE tournament_id = $1`,
            [id]
        );
        response.json({
            tournamentId: id,
            matches: result.rows,
        });
    } catch (error) {
        response.status(500).json({ error: "Database error", details: error });
    }
})

export default router;