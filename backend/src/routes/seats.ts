import db from "../db.js";
import type { Seats } from "../types/seats.js";
import { Router } from "express"


const router = Router();


router.get("/theater/:theaterId", async (req, res) => {
    const theaterId = Number(req.params.theaterId);

    if(!Number.isInteger(theaterId) || theaterId <= 0){
        res.status(400).json({error: 'Ogiltigt salongs ID'});
        return;
    }


    try{

        const [rows] = await db.query<Seats[]>(`
                SELECT seatId, theaterId, \`row\`, seatnumber
                FROM seats
                WHERE theaterId = ?
                ORDER BY \`row\`, seatnumber
            `,
            [theaterId]
        );

        res.json(rows);
    } catch(error){
        console.error('Kunde inte hämta stolar', error);
        res.status(500).json({error: 'Kunde inte hämta stolar'});
    }
});

export default router;