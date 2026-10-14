import { Router } from "express";
import type { tickettype } from "../types/ticketType.js";
import type { ResultSetHeader } from "mysql2";
import db from "../db.js";

const router = Router();

// GET Hämta alla biljettyper
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query<tickettype[]>(`
      SELECT ticketTypeId, price, name
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
      `SELECT ticketTypeId, price, name
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
  const { price, name } = req.body;

  if (
    typeof price !== "number" ||
    !Number.isFinite(price) ||
    price < 0 ||
    typeof name !== "string" ||
    name.trim().length === 0
  ) {
    res.status(400).json({
      error: "Ange ett giltigt pris och ett namn för biljettypen.",
    });
    return;
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO tickettype (price, name)
       VALUES (?, ?)`,
      [price, name.trim()]
    );

    res.status(201).json({
      message: "Biljettypen har skapats",
      tickettype: {
        ticketTypeId: result.insertId,
        price,
        name: name.trim(),
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