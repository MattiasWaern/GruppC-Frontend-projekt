import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../db.js";
import type { Booking, NewBooking } from "../types/booking.js";

const router = Router();

interface BookingRow extends Booking, RowDataPacket {}

function parseSeats(seats: string): number[] {
  return seats
    .split(",")
    .map((seat) => Number(seat))
    .filter((seat) => Number.isInteger(seat));
}

function toResponse(row: BookingRow) {
  const { seats, ...rest } = row;
  return { ...rest, seatIds: parseSeats(seats) };
}

router.get("/", async (req, res) => {
  const userIdParam = req.query.userId;

  try {
    let rows: BookingRow[];

    if (userIdParam !== undefined) {
      const userId = Number(userIdParam);

      if (!Number.isInteger(userId) || userId <= 0) {
        res.status(400).json({
          error: "Ogiltigt användar-ID",
        });
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

    res.status(500).json({
      error: "Kunde inte hämta bokningar",
    });
  }
});

router.get("/:id", async (req, res) => {
  const bookingId = Number(req.params.id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    res.status(400).json({
      error: "Ogiltigt boknings-ID",
    });
    return;
  }

  try {
    const [rows] = await db.query<BookingRow[]>(
      "SELECT * FROM booking WHERE bookingId = ?",
      [bookingId]
    );

    if (rows.length === 0) {
      res.status(404).json({
        error: "Bokningen hittades inte",
      });
      return;
    }

    res.json(toResponse(rows[0]));
  } catch (error) {
    console.error("Kunde inte hämta bokningen:", error);

    res.status(500).json({
      error: "Kunde inte hämta bokningen",
    });
  }
});

router.post("/", async (req, res) => {
  const { userId, viewingId, seatIds } = req.body as NewBooking;

  if (
    !Number.isInteger(userId) ||
    userId <= 0 ||
    !Number.isInteger(viewingId) ||
    viewingId <= 0 ||
    !Array.isArray(seatIds) ||
    seatIds.length === 0 ||
    !seatIds.every((seatId) => Number.isInteger(seatId) && seatId > 0) ||
    new Set(seatIds).size !== seatIds.length
  ) {
    res.status(400).json({
      error: "userId, viewingId och seatIds (unika heltal) krävs",
    });
    return;
  }

  // DUBBELBOKNINGEN
  try {
    const [existing] = await db.query<RowDataPacket[]>(
      "SELECT seats FROM booking WHERE viewingId = ?",
      [viewingId]
    );

    const takenSeats = new Set(
      existing.flatMap((row) => parseSeats(row.seats as string))
    );

    const conflicts = seatIds.filter((seatId) => takenSeats.has(seatId));

    if (conflicts.length > 0) {
      res.status(409).json({
        error: "Platsen är redan bokad",
        seatIds: conflicts,
      });
      return;
    }

    const bookingNumber = `B-${Date.now()}`;
    const bookingDate = new Date().toISOString();

    const [result] = await db.query<ResultSetHeader>(
      `
        INSERT INTO booking
          (userId, viewingId, booking_number, booking_confirmation, booking_date, seats)
        VALUES (?, ?, ?, ?, ?, ?)
      `,
      [userId, viewingId, bookingNumber, "confirmed", bookingDate, seatIds.join(",")]
    );

    res.status(201).json({
      bookingId: result.insertId,
      userId,
      viewingId,
      booking_number: bookingNumber,
      booking_confirmation: "confirmed",
      booking_date: bookingDate,
      seatIds,
    });
  } catch (error) {
    if ((error as { errno?: number }).errno === 1452) {
      res.status(400).json({
        error: "Användaren finns inte",
      });
      return;
    }

    console.error("Kunde inte skapa bokningen:", error);

    res.status(500).json({
      error: "Kunde inte skapa bokningen",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const bookingId = Number(req.params.id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {
    res.status(400).json({
      error: "Ogiltigt boknings-ID",
    });
    return;
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM booking WHERE bookingId = ?",
      [bookingId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({
        error: "Bokningen hittades inte",
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Kunde inte avboka:", error);

    res.status(500).json({
      error: "Kunde inte avboka",
    });
  }
});

export default router;