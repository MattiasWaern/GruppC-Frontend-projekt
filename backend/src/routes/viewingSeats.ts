import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import db from "../db.js";

const router = Router();

router.get("/:id/seat-status", async (req, res) => {
    const viewingId = Number(req.params.id);
    const holdToken = typeof req.query.holdToken === "string" ? req.query.holdToken : "";
  
    if (!Number.isInteger(viewingId) || viewingId <= 0) {
      res.status(400).json({ error: "Ogiltigt visnings-ID" });
      return;
    }
  
    try {
      const [rows] = await db.query<RowDataPacket[]>(
        `SELECT s.seatId, s.\`row\`, s.seatnumber,
                CASE WHEN bs.seatId IS NOT NULL THEN 'booked'
                     WHEN sh.seatId IS NOT NULL THEN 'held'
                     ELSE 'free' END AS status,
                COALESCE(sh.holdToken = ?, 0) AS mine
         FROM viewing v
         INNER JOIN seats s ON s.theaterId = v.theaterId
         LEFT JOIN bokad_stol bs ON bs.seatId = s.seatId AND bs.viewingId = v.viewingId
         LEFT JOIN seat_hold sh ON sh.seatId = s.seatId
                               AND sh.viewingId = v.viewingId
                               AND sh.expiresAt > NOW()
         WHERE v.viewingId = ?
         ORDER BY s.\`row\`, s.seatnumber`,
        [holdToken, viewingId]
      );
  
      if (rows.length === 0) {
        res.status(404).json({ error: "Visningen hittades inte" });
        return;
      }
  
      res.json(rows.map((row) => ({ ...row, mine: Boolean(row.mine) })));
    } catch (error) {
      console.error("Kunde inte hämta platser:", error);
      res.status(500).json({ error: "Kunde inte hämta platser" });
    }
  });

export default router;