import { Router } from "express";
import db from "../db.js";


const router = Router();

//Hämtar alla salong
router.get('/', async (_req, res) => {
    try {
        const [rows] = await db.query(`
                SELECT theaterId, name
                FROM theater
                ORDER BY name
            `);

            res.json(rows);
    } catch (error){
        console.error('Kunde inte hämta Salongerna', error);

        res.status(500).json({ error: 'Kunde inte hämta salonger'});
        
    }
})

// Hämtar en specifik salong

router.get('/:id', async (req,res) => {
    const theaterId = Number(req.params.id);

    if(!Number.isInteger(theaterId) || theaterId <= 0){
        res.status(400).json({error: 'Ogiltigt salong-ID'})
        return;
    }

    try {
        const [rows] = await db.query(`
                SELECT theaterId, name
                FROM theater
                WHERE theaterId = ?
            `,
            [theaterId]
        );

        const theaters = rows as {
            theaterId: number;
            name: string;
        }[];

        if(theaters.length === 0){
            res.status(400).json({error: 'Salongen hittades inte'});
            return;
        }

        res.json(theaters[0]);
    } catch(error){
        console.error('Kunde inte hämta salonger');
    }
});

export default router;