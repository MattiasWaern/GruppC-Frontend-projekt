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

export default router;