import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../db.js";
import type { User } from "../types/user.js";

const router = Router();


// Hämta alla användare
router.get('/', async (_req, res) => {
    try{
        const [rows] = await db.query<User[]>(`
                SELECT userId, name, email, role
                FROM users
                ORDER BY name
            `);
            res.json(rows);
    } catch(error){
        console.error("Kunde inte hämta användare", error);
        res.status(500).json({error: 'kunde inte hämta användare'});
    }
});


// Hämta en specifik Användare med ID
router.get('/:id', async (req,res) => {
    const userId = Number(req.params.id);

    if(!Number.isInteger(userId) || userId <=0){
        res.status(400).json({error: 'Ogiltigt användar ID'});
        return;
    }

    try{
        const [rows] = await db.query<User[]>(`
                SELECT userId, name, email, role
                FROM users
                WHERE userId = ?
            `
            [userId]
        );

        if(rows.length===0){
            res.status(400).json({error: 'Användaren hittades inte'})
            return;
        }

        res.json(rows[0]);
    } catch(error){
        console.error('Kunde inte hämta användaren', error);
        res.status(500).json({error: 'Kunde inte hämta användaren'});
    }
});

// PUT Uppdatera användarens uppgifter


// DELETE Ta bort en användare