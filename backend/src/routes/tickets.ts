import { Router } from "express";
import type { TicketType } from "../types/ticketType.js";
import type { ResultSetHeader } from "mysql2";
import db from "../db.js";


const router = Router();


// Hämtar alla biljett typer
router.get('/', async (_req, res) => {
    try{
        const [rows] = await db.query<[TicketType]>(`
                SELECT ticketTypeId, price, ticket_child, ticket_adult, ticket_senior
                FROM ticketTypeId
                SORT BY name
            `);
        res.json(rows)

    } catch(error){
        console.error('Kunde inte hämta alla biljett typer');
        res.status(500).json({error: 'Kunde inte hämta alla biljett typer'})
    }
})