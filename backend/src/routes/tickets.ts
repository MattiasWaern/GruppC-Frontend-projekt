import { Router } from "express";
import type { tickettype } from "../types/ticketType.js";
import type { ResultSetHeader } from "mysql2";
import db from "../db.js";

const router = Router();

// GET Hämta alla biljettyper
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query<tickettype[]>(`
      SELECT ticketTypeId, price, ticket_child, ticket_adult, ticket_senior
      FROM tickettype
      ORDER BY ticketTypeId
    `);

    res.json(rows);
  } catch (error) {
    console.error("Kunde inte hämta alla biljettyper:", error);
    res.status(500).json({
      error: "Kunde inte hämta alla biljettyper",
    });
  }
});

// GET Hämta en specifik biljettyp
router.get("/:id", async (req, res) => {
  const ticketTypeId = Number(req.params.id);

  if (!Number.isInteger(ticketTypeId) || ticketTypeId <= 0) {
    res.status(400).json({ error: "Ogiltigt biljett-ID" });
    return;
  }

  try {
    const [rows] = await db.query<tickettype[]>(
      `SELECT ticketTypeId, price, ticket_child, ticket_adult, ticket_senior
       FROM tickettype
       WHERE ticketTypeId = ?`,
      [ticketTypeId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Biljettypen hittades inte" });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Kunde inte hämta biljettypen:", error);
    res.status(500).json({
      error: "Kunde inte hämta biljettypen",
    });
  }
});

// POST Skapa en ny biljettyp
router.post("/", async (req, res) => {
  const { price, ticket_child, ticket_adult, ticket_senior } = req.body;

  if (
    ![price, ticket_child, ticket_adult, ticket_senior].every(
      (value) =>
        typeof value === "number" &&
        Number.isFinite(value) &&
        Number.isInteger(value) &&
        value >= 0
    )
  ) {
    res.status(400).json({
      error: "Alla priser måste vara giltiga, positiva heltal eller noll.",
    });
    return;
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO tickettype
       (price, ticket_child, ticket_adult, ticket_senior)
       VALUES (?, ?, ?, ?)`,
      [price, ticket_child, ticket_adult, ticket_senior]
    );

    res.status(201).json({
      message: "Biljettypen har skapats",
      tickettype: {
        ticketTypeId: result.insertId,
        price,
        ticket_child,
        ticket_adult,
        ticket_senior,
      },
    });
  } catch (error) {
    console.error("Kunde inte skapa biljettypen:", error);
    res.status(500).json({
      error: "Kunde inte skapa biljettypen",
    });
  }
});

export default router;
