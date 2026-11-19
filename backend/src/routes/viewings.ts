import { Router } from "express";
import db from "../db.js";
import { requireAdmin } from "../middleware/requireAdmin.js";
import type { ResultSetHeader } from "mysql2";
import type { RowDataPacket } from "mysql2";
import type { Viewing } from "../types/viewing.js";


const router = Router();


// Skapa en ny visning
// Endast Admin och Product Owner
router.post("/", requireAdmin, async (req, res) => {
  const {
    viewing,
    viewing_date,
    viewing_start_time,
    movieId,
    eventId,
    theaterId,
  } = req.body;

  // Kontrollera obligatoriska uppgifter
  if (
    typeof viewing !== "string" ||
    !viewing.trim() ||
    viewing.trim().length > 100 ||
    typeof viewing_date !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(viewing_date) ||
    typeof viewing_start_time !== "string" ||
    !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(viewing_start_time) ||
    !Number.isInteger(theaterId) ||
    theaterId <= 0 ||
    (movieId !== null && (!Number.isInteger(movieId) || movieId <= 0)) ||
    (eventId !== null && (!Number.isInteger(eventId) || eventId <= 0)) ||
    ((movieId === null) === (eventId === null))
  ) {
    res.status(400).json({
      error: "Kontrollera visningens uppgifter. Välj en film eller ett evenemang.",
    });
    return;
  }

  try {
    // Kontrollera att salongen finns
    const [theaters] = await db.query<RowDataPacket[]>(
      "SELECT theaterId FROM theater WHERE theaterId = ?",
      [theaterId]
    );

    if (theaters.length === 0) {
      res.status(400).json({ error: "Salongen finns inte." });
      return;
    }

    // Kontrollera att filmen eller evenemanget finns
    if (movieId !== null) {
      const [movies] = await db.query<RowDataPacket[]>(
        "SELECT movieId FROM movies WHERE movieId = ?",
        [movieId]
      );

      if (movies.length === 0) {
        res.status(400).json({ error: "Filmen finns inte." });
        return;
      }
    }

    if (eventId !== null) {
      const [events] = await db.query<RowDataPacket[]>(
        "SELECT eventId FROM event WHERE eventId = ?",
        [eventId]
      );

      if (events.length === 0) {
        res.status(400).json({ error: "Evenemanget finns inte." });
        return;
      }
    }

    // Skapa visningen
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO viewing
        (viewing, viewing_date, viewing_start_time, movieId, eventId, theaterId)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        viewing.trim(),
        viewing_date,
        viewing_start_time,
        movieId,
        eventId,
        theaterId,
      ]
    );

    res.status(201).json({
      message: "Visningen har lagts till!",
      viewingId: result.insertId,
    });
  } catch (error) {
    console.error("Kunde inte lägga till visning:", error);

    res.status(500).json({
      error: "Kunde inte lägga till visningen.",
    });
  }
});


router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query(`
  SELECT
    viewingId,
    DATE_FORMAT(viewing_date, '%Y-%m-%d') AS viewing_date,
    viewing_start_time,
    movieId,
    eventId,
    theaterId,
    viewing
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


router.get("/:id/availability", async (req, res) => {
  const viewingId = Number(req.params.id);

  if (!Number.isInteger(viewingId) || viewingId <= 0) {
    res.status(400).json({ error: "Ogiltigt visnings-ID" });
    return;
  }

  try {
    const [viewings] = await db.query<RowDataPacket[]>(
      `SELECT theaterId FROM viewing WHERE viewingId = ?`,
      [viewingId]
    );

    if (viewings.length === 0) {
      res.status(404).json({ error: "Visningen hittades inte" });
      return;
    }

    const theaterId = Number(viewings[0].theaterId);

    const [stats] = await db.query<RowDataPacket[]>(
      `
      SELECT 
        (SELECT COUNT(*) FROM seats WHERE theaterId = ?) AS totalSeats,
        (SELECT COUNT(DISTINCT bs.seatId) 
         FROM bokad_stol bs 
         INNER JOIN booking b ON b.bookingId = bs.bookingId 
         WHERE b.viewingId = ? AND b.booking_confirmation = 'confirmed'
        ) AS bookedSeats
      `,
      [theaterId, viewingId]
    );

    const totalSeats = Number(stats[0].totalSeats);
    const bookedSeats = Number(stats[0].bookedSeats);
    const availableSeats = totalSeats - bookedSeats;

    res.json({
      viewingId,
      totalSeats,
      bookedSeats,
      availableSeats,
    });
  } catch (error) {
    console.error("Kunde inte hämta stolstatistik:", error);
    res.status(500).json({
      error: "Kunde inte hämta stolstatistik",
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
    const [rows] = await db.query<Viewing[]>(
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