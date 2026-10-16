import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import db from "../db.js";
import type { Seats } from "../types/seats.js";

const router = Router();


router.get("/theater/:theaterId", async (req, res) => {
  const theaterId = Number(req.params.theaterId);
  const viewingId = Number(req.query.viewingId);

  if (!Number.isInteger(theaterId) || theaterId <= 0) {
    res.status(400).json({ error: "Ogiltigt salongs-ID" });
    return;
  }

  if (!Number.isInteger(viewingId) || viewingId <= 0) {
    res.status(400).json({ error: "Ogiltigt visnings-ID" });
    return;
  }

  try {
    const [rows] = await db.query<Seats[]>(
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
          ) THEN 1
          ELSE 0
        END AS isBooked
      FROM seats s
      WHERE s.theaterId = ?
      ORDER BY s.\`row\`, s.seatnumber
      `,
      [viewingId, theaterId]
    );

    res.json(rows);
  } catch (error) {
    console.error("Kunde inte hämta stolar:", error);
    res.status(500).json({ error: "Kunde inte hämta stolar" });
  }
});

export default router;