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
                FROM ticketType
                ORDER BY ticketTypeId
            `);
        res.json(rows)

    } catch(error){
        console.error('Kunde inte hämta alla biljett typer');
        res.status(500).json({error: 'Kunde inte hämta alla biljett typer'})
    }
})


// GET  Hämta en specifik biljettTyp
router.get("/:id", async (req, res) => {
  const ticketTypeId = Number(req.params.id);

  if (!Number.isInteger(ticketTypeId) || ticketTypeId <= 0) {
    res.status(400).json({ error: "Ogiltigt Biljett typ" });
    return;
  }

  try {
    const [rows] = await db.query<TicketType[]>(
      `SELECT ticketTypeId, price, ticket_child, ticket_adult, ticket_senior
       FROM users
       WHERE userId = ?`,
      [ticketTypeId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Biljett typ hittades inte" });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Kunde inte hämta Biljett typ:", error);
    res.status(500).json({ error: "Kunde inte hämta Biljett typ" });
  }
});

export default router;