import { Router } from "express";

import type { ResultSetHeader, RowDataPacket } from "mysql2";

import db from "../db.js";

import type { Booking } from "../types/booking.js";

import { randomInt } from "node:crypto";

import jwt, { type JwtPayload } from "jsonwebtoken";

import { sendBookingConfirmationEmail } from "../email.js";

function isAgeAllowed(age: number, ageLimit: number, hasAdult: boolean): boolean {
  if (ageLimit === 0) return true;
  if (ageLimit === 7) return age >= 7 || hasAdult;
  if (ageLimit === 11) return age >= 11 || (age >= 7 && hasAdult);
  if (ageLimit === 15) return age >= 15 || (age >= 11 && hasAdult);
  return false;
}

const router = Router();

function generateBookingNumber(): string {

  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  const randomPart = Array.from(

    { length: 5 },

    () => characters[randomInt(characters.length)],

  ).join("");

  return `FV-${randomPart}`;

}

type AuthPayload = JwtPayload & { userId: number };

function readAuthenticatedUser(req: { headers: { authorization?: string } }): {

  userId: number | null;

  invalid: boolean;

} {

  const authorization = req.headers.authorization;

  if (!authorization) return { userId: null, invalid: false };

  if (!authorization.startsWith("Bearer "))

    return { userId: null, invalid: true };

  const secret = process.env.JWT_SECRET;

  if (!secret) throw new Error("JWT_SECRET saknas");

  try {

    const payload = jwt.verify(authorization.slice(7), secret) as AuthPayload;

    if (!Number.isSafeInteger(payload.userId) || payload.userId <= 0) {

      return { userId: null, invalid: true };

    }

    return { userId: payload.userId, invalid: false };

  } catch {

    return { userId: null, invalid: true };

  }

}

interface BookingRow extends Booking, RowDataPacket {}

interface TicketInput {

  seatId: number;

  ticketTypeId: number;

}

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

        [userId],

      );

    } else {

      [rows] = await db.query<BookingRow[]>(

        "SELECT * FROM booking ORDER BY bookingId DESC",

      );

    }

    res.json(rows.map(toResponse));

  } catch (error) {

    console.error("Kunde inte hämta bokningar:", error);

    res.status(500).json({ error: "Kunde inte hämta bokningar" });

  }

});

router.get("/mine", async (req, res) => {

  const authorization = req.headers.authorization;

  if (!authorization?.startsWith("Bearer ")) {

    res.status(401).json({

      error: "Du måste vara inloggad för att se dina bokningar.",

    });

    return;

  }

  const token = authorization.slice(7);

  const secret = process.env.JWT_SECRET;

  if (!secret) {

    res.status(500).json({

      error: "Serverns autentisering är inte konfigurerad.",

    });

    return;

  }

  let userId: number;

  try {

    const decoded = jwt.verify(token, secret);

    if (

      typeof decoded === "string" ||

      typeof (decoded as JwtPayload).userId !== "number" ||

      !Number.isSafeInteger((decoded as JwtPayload).userId) ||

      (decoded as JwtPayload).userId <= 0

    ) {

      res.status(401).json({ error: "Ogiltig inloggning." });

      return;

    }

    userId = (decoded as JwtPayload).userId;

  } catch {

    res.status(401).json({

      error: "Din inloggning har gått ut. Logga in igen.",

    });

    return;

  }

  try {

    const [rows] = await db.query<RowDataPacket[]>(

      `

      SELECT

        b.bookingId,

        b.booking_number AS bookingNumber,

        b.booking_confirmation AS status,

        b.booking_date AS bookingDate,

        v.viewingId,

        v.viewing_date AS viewingDate,

        v.viewing_start_time AS viewingTime,

        m.title AS movieTitle,

        t.name AS theaterName,

        COUNT(bs.seatId) AS ticketCount,

        COALESCE(SUM(tt.price), 0) AS totalPrice,

        GROUP_CONCAT(

          CONCAT('Rad ', s.\\`rows\\`, ', plats ', s.seatnumber)

          ORDER BY s.\\`rows\\`, s.seatnumber

          SEPARATOR ' | '

        ) AS seatLabels

      FROM booking b

      INNER JOIN viewing v

        ON v.viewingId = b.viewingId

      INNER JOIN movies m

        ON m.movieId = v.movieId

      INNER JOIN theater t

        ON t.theaterId = v.theaterId

      LEFT JOIN bokad_stol bs

        ON bs.bookingId = b.bookingId

      LEFT JOIN seats s

        ON s.seatId = bs.seatId

      LEFT JOIN tickettype tt

        ON tt.ticketTypeId = bs.ticketTypeId

      WHERE b.userId = ?

      GROUP BY

        b.bookingId,

        b.booking_number,

        b.booking_confirmation,

        b.booking_date,

        v.viewingId,

        v.viewing_date,

        v.viewing_start_time,

        m.title,

        t.name

      ORDER BY

        v.viewing_date DESC,

        v.viewing_start_time DESC

      `,

      [userId],

    );

    res.json(

      rows.map((row) => ({

        ...row,

        ticketCount: Number(row.ticketCount),

        totalPrice: Number(row.totalPrice),

        seatLabels: row.seatLabels ? String(row.seatLabels).split(" | ") : [],

      })),

    );

  } catch (error) {

    console.error("Kunde inte hämta bokningshistorik:", error);

    res.status(500).json({

      error: "Kunde inte hämta dina bokningar.",

    });

  }

});

// GET: Hämta en bokning med stolar, biljettyp och pris per stol.

router.get("/:id/tickets", async (req, res) => {

  const bookingId = Number(req.params.id);

  if (!Number.isInteger(bookingId) || bookingId <= 0) {

    res.status(400).json({ error: "Ogiltigt boknings-ID" });

    return;

  }

  try {

    const [rows] = await db.query<RowDataPacket[]>(

      `SELECT bs.seatId, s.\\`row\\`, s.seatnumber,

              tt.ticketTypeId, tt.name AS ticketType, tt.price

       FROM bokad_stol bs

       INNER JOIN seats s ON s.seatId = bs.seatId

       INNER JOIN tickettype tt ON tt.ticketTypeId = bs.ticketTypeId

       WHERE bs.bookingId = ?

       ORDER BY s.\\`row\\`, s.seatnumber`,

      [bookingId],

    );

    const totalPrice = rows.reduce((sum, r) => sum + Number(r.price), 0);

    res.json({ bookingId, tickets: rows, totalPrice });

  } catch (error) {

    console.error("Kunde inte hämta biljetter:", error);

    res.status(500).json({ error: "Kunde inte hämta biljetter" });

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

      [bookingId],

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

// POST: Boka som inloggad användare eller gäst.

router.post("/", async (req, res) => {

  const body = (req.body ?? {}) as {

    viewingId?: number;

    tickets?: TicketInput[];

    seatIds?: number[];

    ticketTypeId?: number;

    guestName?: string;

    guestEmail?: string;

  };

  const auth = readAuthenticatedUser(req);

  if (auth.invalid) {

    res

      .status(401)

      .json({ error: "Ogiltig eller utgången inloggning. Logga in igen." });

    return;

  }

  const userId = auth.userId;

  const viewingId = body.viewingId;

  const guestName =

    typeof body.guestName === "string" ? body.guestName.trim() : "";

  const guestEmail =

    typeof body.guestEmail === "string"

      ? body.guestEmail.trim().toLowerCase()

      : "";

  if (

    userId === null &&

    (guestName.length < 2 ||

      guestName.length > 100 ||

      guestEmail.length > 254 ||

      !/^[^\s@]+@[^\s@]+**\.**[^\s@]+$/.test(guestEmail))

  ) {

    res

      .status(400)

      .json({ error: "Gäster måste ange namn och giltig e-postadress" });

    return;

  }

  let tickets: TicketInput[] = [];

  if (Array.isArray(body.tickets)) {

    tickets = body.tickets;

  } else if (Array.isArray(body.seatIds)) {

    tickets = body.seatIds.map((seatId) => ({

      seatId,

      ticketTypeId: body.ticketTypeId as number,
      age: NaN, // Äldre API-format saknar ålder och ska inte kunna kringgå kontrollen.

    }));

  }

  if (

    typeof viewingId !== "number" ||

    !Number.isInteger(viewingId) ||

    viewingId <= 0 ||

    tickets.length === 0 ||

    !tickets.every(

      (t) =>

        t &&

        Number.isInteger(t.seatId) &&

        t.seatId > 0 &&

        Number.isInteger(t.ticketTypeId) &&

        t.ticketTypeId > 0 &&
        Number.isInteger(t.age) &&
        t.age >= 0 &&
        t.age <= 120,

    ) ||

    new Set(tickets.map((t) => t.seatId)).size !== tickets.length

  ) {

    res.status(400).json({

      error: "viewingId och tickets (unika seatId med ticketTypeId) krävs",

    });

    return;

  }

  const seatIds = tickets.map((t) => t.seatId);

  const ticketTypeIds = [...new Set(tickets.map((t) => t.ticketTypeId))];

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    // Låser visningen så att två bokningar för samma visning inte körs samtidigt.

    const [viewings] = await conn.query<RowDataPacket[]>(

      "SELECT v.theaterId, m.age_limit AS ageLimit FROM viewing v INNER JOIN movies m ON m.movieId = v.movieId WHERE v.viewingId = ? FOR UPDATE",

      [viewingId],

    );

    if (viewings.length === 0) {

      await conn.rollback();

      res.status(404).json({ error: "Visningen hittades inte" });

      return;

    }

    const ageLimit = Number(viewings[0].ageLimit);
    if (![0, 7, 11, 15].includes(ageLimit)) {
      await conn.rollback();
      res.status(400).json({ error: "Filmens åldersgräns är ogiltig." });
      return;
    }

    const hasAdultCompanion = tickets.some((ticket) => ticket.age >= 18);
    if (!tickets.every((ticket) => isAgeAllowed(ticket.age, ageLimit, hasAdultCompanion))) {
      await conn.rollback();
      res.status(400).json({ error: "En eller flera besökare uppfyller inte filmens åldersgräns." });
      return;
    }

    // Hämta priser för alla biljettyper som används.

    const [ticketTypes] = await conn.query<RowDataPacket[]>(

      `SELECT ticketTypeId, price FROM tickettype

       WHERE ticketTypeId IN (${ticketTypeIds.map(() => "?").join(",")})`,

      ticketTypeIds,

    );

    if (ticketTypes.length !== ticketTypeIds.length) {

      await conn.rollback();

      res.status(400).json({ error: "En eller flera biljettyper finns inte" });

      return;

    }

    const priceById = new Map<number, number>(

      ticketTypes.map((r) => [Number(r.ticketTypeId), Number(r.price)]),

    );

    const seatPlaceholders = seatIds.map(() => "?").join(",");

    const [seats] = await conn.query<RowDataPacket[]>(

      `SELECT seatId FROM seats

       WHERE theaterId = ? AND seatId IN (${seatPlaceholders})`,

      [viewings[0].theaterId, ...seatIds],

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

       WHERE b.viewingId = ? AND bs.seatId IN (${seatPlaceholders})`,

      [viewingId, ...seatIds],

    );

    if (existing.length > 0) {

      await conn.rollback();

      res.status(409).json({

        error: "En eller flera stolar är redan bokade",

        seatIds: existing.map((row) => Number(row.seatId)),

      });

      return;

    }

    const bookingNumber = generateBookingNumber();

    const bookingDate = new Date().toISOString();

    const [result] = await conn.query<ResultSetHeader>(

      `INSERT INTO booking

       (userId, guest_name, guest_email, viewingId, booking_number, booking_confirmation, booking_date, seats)

       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,

      [

        userId,

        userId === null ? guestName : null,

        userId === null ? guestEmail : null,

        viewingId,

        bookingNumber,

        "confirmed",

        bookingDate,

        seatIds.join(","),

      ],

    );

    const bookingId = result.insertId;

    // En rad per stol, var och en med sin egen biljettyp.

    // viewingId behövs eftersom bokad_stol har UNIQUE (viewingId, seatId).

    await conn.query<ResultSetHeader>(

      "INSERT INTO bokad_stol (bookingId, seatId, ticketTypeId, viewingId) VALUES ?",

      [tickets.map((t) => [bookingId, t.seatId, t.ticketTypeId, viewingId])],

    );

    await conn.commit();

    const totalPrice = tickets.reduce(

      (sum, t) => sum + (priceById.get(t.ticketTypeId) ?? 0),

      0,

    );

    let emailSent = false;

    try {

      let email = guestEmail;

      if (userId !== null) {

        const [users] = await db.query<RowDataPacket[]>(

          "SELECT email FROM users WHERE userId = ?",

          [userId],

        );

        email = typeof users[0]?.email === "string" ? users[0].email : "";

      }

      if (!email) throw new Error("Ingen e-postadress för bokningsbekräftelse");

      await sendBookingConfirmationEmail({ to: email, bookingNumber });

      emailSent = true;

    } catch (error) {

      console.error("Kunde inte skicka bokningsbekräftelsen:", error);

    }

    res.status(201).json({

      bookingId,

      userId,

      viewingId,

      booking_number: bookingNumber,

      booking_confirmation: "confirmed",

      booking_date: bookingDate,

      seatIds,

      emailSent,

      tickets: tickets.map((t) => ({

        ...t,

        price: priceById.get(t.ticketTypeId),

      })),

      totalPrice,

    });

  } catch (error) {

    try {

      await conn.rollback();

    } catch (rollbackError) {

      console.error("Kunde inte återställa transaktionen:", rollbackError);

    }

    const errno = (error as { errno?: number }).errno;

    // 1062 = dubblett: UNIQUE (viewingId, seatId) i bokad_stol stoppade dubbelbokning

    if (errno === 1062) {

      res.status(409).json({ error: "En eller flera stolar är redan bokade" });

      return;

    }

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

// DELETE: Ta bort en bokning och dess stolar med bokningsnumret och inte ID nu.

router.delete("/", async (req, res) => {

  const { email, booking_number } = req.body ?? {};

  if (

    typeof email !== "string" ||

    typeof booking_number !== "string" ||

    !email.trim() ||

    !booking_number.trim()

  ) {

    res.status(400).json({

      error: "Ange e-post och bokningsnummer",

    });

    return;

  }

  const conn = await db.getConnection();

  try {

    await conn.beginTransaction();

    // Hämta bookingId med hjälp av bokningsnumret

    const [bookings] = await conn.query<RowDataPacket[]>(

      `SELECT b.bookingId

       FROM booking b

       LEFT JOIN users u ON u.userId = b.userId

       WHERE b.booking_number = ? AND (u.email = ? OR b.guest_email = ?)

       FOR UPDATE`,

      [booking_number.trim().toUpperCase(), email.trim(), email.trim()],

    );

    if (bookings.length === 0) {

      await conn.rollback();

      res.status(404).json({

        error: "Bokningen hittades inte",

      });

      return;

    }

    const bookingId = bookings[0].bookingId;

    // Radera bokade stolar först

    await conn.query<ResultSetHeader>(

      "DELETE FROM bokad_stol WHERE bookingId = ?",

      [bookingId],

    );

    // Radera själva bokningen

    const [result] = await conn.query<ResultSetHeader>(

      "DELETE FROM booking WHERE bookingId = ?",

      [bookingId],

    );

    if (result.affectedRows === 0) {

      await conn.rollback();

      res.status(404).json({

        error: "Bokningen hittades inte",

      });

      return;

    }

    await conn.commit();

    res.status(204).send();

  } catch (error) {

    try {

      await conn.rollback();

    } catch (rollbackError) {

      console.error("Kunde inte återställa transaktionen:", rollbackError);

    }

    console.error("Kunde inte avboka:", error);

    res.status(500).json({

      error: "Kunde inte avboka",

    });

  } finally {

    conn.release();

  }

});

export default router;
