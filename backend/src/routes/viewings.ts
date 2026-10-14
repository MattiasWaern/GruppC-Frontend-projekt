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


router.get('/:id/seats', async(req, res) => {
  const viewingId = Number(req.params.id);


  if(!Number.isInteger(viewingId) || viewingId <= 0){
    res.status(400).json({error: 'Ogiltigt visnings ID'});
    return;
  }
})


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
      WHERE viewing_id = ?
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