import { Router } from "express";
import db from "../db.js";


const router = Router();

//Hämtar alla Theaters
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

