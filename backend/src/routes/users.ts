import { Router } from "express";
import bcrypt from "bcrypt";
import type { ResultSetHeader } from "mysql2";
import db from "../db.js";
import type { User } from "../types/user.js";

const router = Router();


// Hämta alla användard
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
router.put('/:id', async (req, res) => {
    const userId = Number(req.params.id);
    const {name, email, role } = req.body;

    if(!Number.isInteger(userId) ||userId <= 0){
        res.status(400).json({error: 'Ogiltigt användar ID'});
        return;
    }

    if (
        typeof name !== "string" || !name.trim() ||
        typeof email !== "string" || !email.trim() ||
        (role !== null && role !== undefined && !Number.isInteger(role))
    ) {
        res.status(400).json({error: 'Ange ett giltigt namn, e-post och roll'});
        return;
    }

    try{
        const [result] = await db.query<ResultSetHeader>(`
                UPDATE users
                SET name = ?, email = ?, role = ?
                WHERE userId = ?
                `
                [name.trim(), email.trim(), role ?? null, userId]
        );

        if (result.affectedRows === 0) {
        const [rows] = await db.query<User[]>(
            `SELECT userId FROM users WHERE userId = ?`,
            [userId]
        );

        if (rows.length === 0) {
            res.status(404).json({ error: "Användaren hittades inte" });
            return;
        }
        }

        res.json({ message: "Användaren har uppdaterats" });
    } catch (error) {
        console.error("Kunde inte uppdatera användaren:", error);
        res.status(500).json({
        error: "Kunde inte uppdatera användaren",
        });
    }
});

// POST Uppdatera valda fälten

// DELETE Ta bort en användare

router.delete('/:id', async (req, res) => {
    const userId = Number(req.params.id);

    if(!Number.isInteger(userId) || userId <= 0){
        res.status(400).json({error: 'Ogiltigt användare ID'})
        return;
    }

    try{
        const [results] = await db.query<ResultSetHeader>(`
                DELETE FROM users WHERE userId = ?    
            `
            [userId]
        );

        if(results.affectedRows === 0){
            res.status(404).json({error: 'Användaren hittades inte'});
            return;
        }
        res.json({message: 'Användaren har tagits bort'});

    } catch(error){
        console.error('Kunde inte ta bort användaren', error);
        res.status(500).json({error: 'Kunte inte ta bort användaren'});
    }
})


export default router;