import { randomBytes } from "node:crypto";
import { Router } from "express";
import type { RowDataPacket } from "mysql2";
import db from "../db.js";

const router = Router();

const HOLD_MINUTES = 10;

router.post("/", async (req, res) => {
  const { viewingId, seatIds, holdToken } = (req.body ?? {}) as {
    viewingId?: number;
    seatIds?: number[];
    holdToken?: string;
  };

  if (
    typeof viewingId !== "number" ||
    !Number.isInteger(viewingId) ||
    viewingId <= 0 ||
    !Array.isArray(seatIds) ||
    seatIds.length === 0 ||
    !seatIds.every((id) => Number.isInteger(id) && id > 0) ||
    new Set(seatIds).size !== seatIds.length
  ) {
    res.status(400).json({ error: "viewingId och seatIds (unika heltal) krävs" });
    return;
  }

  const placeholders = seatIds.map(() => "?").join(",");

  const conn = await db.getConnection();

  try {
    await conn.beginTransaction();

    const [viewings] = await conn.query<RowDataPacket[]>(
      "SELECT theaterId FROM viewing WHERE viewingId = ? FOR UPDATE",
      [viewingId]
    );

    if (viewings.length === 0) {
      await conn.rollback();
      res.status(404).json({ error: "Visningen hittades inte" });
      return;
    }

    await conn.query(
      "DELETE FROM seat_hold WHERE viewingId = ? AND expiresAt <= NOW()",
      [viewingId]
    );

    if (typeof holdToken === "string" && holdToken) {
      await conn.query("DELETE FROM seat_hold WHERE holdToken = ?", [holdToken]);
    }

    const [seats] = await conn.query<RowDataPacket[]>(
      `SELECT seatId FROM seats
       WHERE theaterId = ? AND seatId IN (${placeholders})`,
      [viewings[0].theaterId, ...seatIds]
    );

    if (seats.length !== seatIds.length) {
      await conn.rollback();
      res.status(400).json({
        error: "En eller flera platser tillhör inte visningens salong",
      });
      return;
    }

    const [booked] = await conn.query<RowDataPacket[]>(
      `SELECT seatId FROM bokad_stol
       WHERE viewingId = ? AND seatId IN (${placeholders})`,
      [viewingId, ...seatIds]
    );

    if (booked.length > 0) {
      await conn.rollback();
      res.status(409).json({
        error: "En eller flera platser är redan bokade",
        seatIds: booked.map((row) => Number(row.seatId)),
      });
      return;
    }

    const newToken = randomBytes(16).toString("hex");

    await conn.query(
      `INSERT INTO seat_hold (holdToken, viewingId, seatId, expiresAt)
       SELECT ?, ?, seatId, DATE_ADD(NOW(), INTERVAL ${HOLD_MINUTES} MINUTE)
       FROM seats
       WHERE seatId IN (${placeholders})`,
      [newToken, viewingId, ...seatIds]
    );

    const [time] = await conn.query<RowDataPacket[]>(
      `SELECT TIMESTAMPDIFF(SECOND, NOW(), MIN(expiresAt)) AS secondsLeft
       FROM seat_hold
       WHERE holdToken = ?`,
      [newToken]
    );

    await conn.commit();

    res.status(201).json({
      holdToken: newToken,
      viewingId,
      seatIds,
      secondsLeft: Number(time[0].secondsLeft),
    });
  } catch (error) {
    try {
      await conn.rollback();
    } catch (rollbackError) {
      console.error("Kunde inte återställa transaktionen:", rollbackError);
    }

    const errno = (error as { errno?: number }).errno;

    if (errno === 1062) {
      res.status(409).json({
        error: "En eller flera platser är reserverade av någon annan",
      });
      return;
    }

    console.error("Kunde inte reservera platser:", error);
    res.status(500).json({ error: "Kunde inte reservera platser" });
  } finally {
    conn.release();
  }
});

export default router;