import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../db.js";
import type { Booking, NewBooking } from "../types/booking.js";

const router = Router();

interface BookingRow extends Booking, RowDataPacket {}

function parseSeats(seats: string | null): number[] {
  if (!seats) return [];

  return seats
    .split(",")
    .map((seat) => Number(seat))
    .filter((seat) => Number.isInteger(seat) && seat > 0);
}

function toResponse(row: BookingRow) {
  const { seats, ...rest } = row;
  return {
    ...rest,
    seatIds: parseSeats(seats),
  };
}

// GET: Hämta alla bokningar, eller filtrera på userId.
router.get("/", async (req, res) => {
  const userIdParam = req.query.userId;

  try {
    let rows: BookingRow[];

    if (userIdParam !== undefined) {
      const userId = Number(userIdParam);

      if (!Number.isInteger(userId) || userId <= 0) {
        res.status(400).json({ error: "Ogiltigt användar-ID" });
        return;
      }

      [rows] = await db.query<BookingRow[]>(
        "SELECT * FROM booking WHERE userId = ? ORDER BY bookingId DESC",
        [userId]
      );
    } else {
      [rows] = await db.query<BookingRow[]>(
        "SELECT * FROM booking ORDER BY bookingId DESC"
      );
    }

    res.json(rows.map(toResponse));
  } catch (error) {
    console.error("Kunde inte hämta bokningar:", error);
    res.status(500).json({ error: "Kunde inte hämta bokningar" });
  }
});

// GET: Hämta en specifik bokning.
router.get("/:id", async (req, res) => {
  const bookingId = Number(req.params.id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    res.status(400).json({ error: "Ogiltigt boknings-ID" });
    return;
  }

  try {
    const [rows] = await db.query<BookingRow[]>(
      "SELECT * FROM booking WHERE bookingId = ?",
      [bookingId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Bokningen hittades inte" });
      return;
    }

    res.json(toResponse(rows[0]));
  } catch (error) {
    console.error("Kunde inte hämta bokningen:", error);
    res.status(500).json({ error: "Kunde inte hämta bokningen" });
  }
});

// POST: Skapa en bokning och koppla bokade stolar.
router.post("/", async (req, res) => {
  const { userId, viewingId, seatIds, ticketTypeId } = req.body as {
    userId: number;
    viewingId: number;
    seatIds: number[];
    ticketTypeId: number;
  };

  if (
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !Number.isInteger(viewingId) ||
    viewingId <= 0 ||
    !Number.isInteger(ticketTypeId) ||
    ticketTypeId <= 0 ||
    !Array.isArray(seatIds) ||
    seatIds.length === 0 ||
    !seatIds.every((seatId) => Number.isInteger(seatId) && seatId > 0) ||
    new Set(seatIds).size !== seatIds.length
  ) {
    res.status(400).json({
      error: "userId, viewingId, ticketTypeId och unika seatIds krävs",
    });
    return;
  }

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    // Låser visningen så att två bokningar för samma visning inte körs samtidigt.
    const [viewings] = await conn.query<RowDataPacket[]>(
      "SELECT theaterId FROM viewing WHERE viewingId = ? FOR UPDATE",
      [viewingId]
    );

    if (viewings.length === 0) {
      await conn.rollback();
      res.status(404).json({ error: "Visningen hittades inte" });
      return;
    }

    const [ticketTypes] = await conn.query<RowDataPacket[]>(
      "SELECT ticketTypeId FROM tickettype WHERE ticketTypeId = ?",
      [ticketTypeId]
    );

    if (ticketTypes.length === 0) {
      await conn.rollback();
      res.status(400).json({ error: "Biljettypen finns inte" });
      return;
    }

    const placeholders = seatIds.map(() => "?").join(",");

    const [seats] = await conn.query<RowDataPacket[]>(
      `SELECT seatId FROM seats
       WHERE theaterId = ? AND seatId IN (${placeholders})`,
      [viewings[0].theaterId, ...seatIds]
    );

    if (seats.length !== seatIds.length) {
      await conn.rollback();
      res.status(400).json({
        error: "En eller flera stolar tillhör inte visningens salong",
      });
      return;
    }

    const [existing] = await conn.query<RowDataPacket[]>(
      `SELECT bs.seatId
       FROM bokad_stol bs
       INNER JOIN booking b ON b.bookingId = bs.bookingId
       WHERE b.viewingId = ? AND bs.seatId IN (${placeholders})`,
      [viewingId, ...seatIds]
    );

    if (existing.length > 0) {
      await conn.rollback();
      res.status(409).json({
        error: "En eller flera stolar är redan bokade",
        seatIds: existing.map((row) => Number(row.seatId)),
      });
      return;
    }

    const bookingNumber = `B-${Date.now()}`;
    const bookingDate = new Date().toISOString();

    const [result] = await conn.query<ResultSetHeader>(
      `INSERT INTO booking
       (userId, viewingId, booking_number, booking_confirmation, booking_date, seats)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, viewingId, bookingNumber, "confirmed", bookingDate, seatIds.join(",")]
    );

    const bookingId = result.insertId;

    // En rad per stol i bokad_stol.
    await conn.query<ResultSetHeader>(
      "INSERT INTO bokad_stol (bookingId, seatId, ticketTypeId) VALUES ?",
      [seatIds.map((seatId) => [bookingId, seatId, ticketTypeId])]
    );

    await conn.commit();

    res.status(201).json({
      bookingId,
      userId,
      viewingId,
      booking_number: bookingNumber,
      booking_confirmation: "confirmed",
      booking_date: bookingDate,
      seatIds,
      ticketTypeId,
    });
  } catch (error) {
    try {
      await conn.rollback();
    } catch (rollbackError) {
      console.error("Kunde inte återställa transaktionen:", rollbackError);
    }

    const errno = (error as { errno?: number }).errno;

    if (errno === 1452) {
      res.status(400).json({
        error: "Användaren, visningen, stolen eller biljettypen finns inte",
      });
      return;
    }

    console.error("Kunde inte skapa bokningen:", error);
    res.status(500).json({ error: "Kunde inte skapa bokningen" });
  } finally {
    conn.release();
  }
});

// DELETE: Ta bort en bokning.
router.delete("/:id", async (req, res) => {
  const bookingId = Number(req.params.id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    res.status(400).json({ error: "Ogiltigt boknings-ID" });
    return;
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM booking WHERE bookingId = ?",
      [bookingId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Bokningen hittades inte" });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Kunde inte avboka:", error);
    res.status(500).json({ error: "Kunde inte avboka" });
  }
});

export default router;
