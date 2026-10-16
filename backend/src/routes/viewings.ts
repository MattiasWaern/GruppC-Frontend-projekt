import { Router } from "express";
import db from "../db.js";
import type { Viewing } from "../types/viewing.js";
import type { RowDataPacket } from "mysql2";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query<Viewing[]>(`
      SELECT *
      FROM viewing
      ORDER BY viewing_date, viewing_start_time
      `);
    res.json(rows);
  } catch (error) {
    console.error("Kunde inte hämta visningar:", error);

    res.status(500).json({
      error: "Kunde inte hämta visningar",
    });
  }
});


router.get("/:id/seats", async (req, res) => {
  const viewingId = Number(req.params.id);

  if (!Number.isInteger(viewingId) || viewingId <= 0) {
    res.status(400).json({ error: "Ogiltigt visnings-ID" });
    return;
  }

  try {
    // Hämta visningen och dess salong.
    const [viewings] = await db.query<RowDataPacket[]>(
      `SELECT theaterId
       FROM viewing
       WHERE viewingId = ?`,
      [viewingId]
    );

    if (viewings.length === 0) {
      res.status(404).json({ error: "Visningen hittades inte" });
      return;
    }

    const theaterId = Number(viewings[0].theaterId);

    // Hämta salongens alla stolar och kontrollera bokningsstatus.
    const [seats] = await db.query<RowDataPacket[]>(
      `
      SELECT
        s.seatId,
        s.theaterId,
        s.\`row\`,
        s.seatnumber,
        CASE
          WHEN EXISTS (
            SELECT 1
            FROM bokad_stol bs
            INNER JOIN booking b
              ON b.bookingId = bs.bookingId
            WHERE bs.seatId = s.seatId
              AND b.viewingId = ?
              AND b.booking_confirmation = 'confirmed'
          ) THEN 1
          ELSE 0
        END AS isBooked
      FROM seats s
      WHERE s.theaterId = ?
      ORDER BY s.\`row\`, s.seatnumber
      `,
      [viewingId, theaterId]
    );

    res.json(seats);
  } catch (error) {
    console.error("Kunde inte hämta visningens stolar:", error);

    res.status(500).json({
      error: "Kunde inte hämta visningens stolar",
    });
  }
});


router.get("/:id", async (req, res) => {
  const viewingId = Number(req.params.id);

  if (!Number.isInteger(viewingId) || viewingId <= 0) {
    res.status(400).json({
      error: "Ogiltigt visings-ID"
    });
    return;
  }

  try {
    const [rows] = await db.query <Viewing[] > (
      `
      SELECT *
      FROM viewing
      WHERE viewingId = ?
      `,
      [viewingId]
    );

    if (rows.length === 0) {
      res.status(404).json({
        error: "Visningen hittades inte",
      });

      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Kunde inte hämta visningen:", error);

    res.status(500).json({
      error: "Kunde inte hämta visningen",
    });
  }
});

export default router;