import { Router } from "express";
import bcrypt from "bcrypt";
import type { ResultSetHeader } from "mysql2";
import db from "../db.js";
import type { User } from "../types/user.js";

const router = Router();

// GET  Hämta alla användare
router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query<User[]>(`
      SELECT userId, name, email, role
      FROM users
      ORDER BY name
    `);

    res.json(rows);
  } catch (error) {
    console.error("Kunde inte hämta användare:", error);
    res.status(500).json({ error: "Kunde inte hämta användare" });
  }
});

// GET  Hämta en specifik användare
router.get("/:id", async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: "Ogiltigt användar-ID" });
    return;
  }

  try {
    const [rows] = await db.query<User[]>(
      `SELECT userId, name, email, role
       FROM users
       WHERE userId = ?`,
      [userId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: "Användaren hittades inte" });
      return;
    }

    res.json(rows[0]);
  } catch (error) {
    console.error("Kunde inte hämta användaren:", error);
    res.status(500).json({ error: "Kunde inte hämta användaren" });
  }
});

// PUT Uppdatera användarens uppgifter
router.put("/:id", async (req, res) => {
  const userId = Number(req.params.id);
  const { name, email, role } = req.body;

  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: "Ogiltigt användar-ID" });
    return;
  }

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    (role !== null &&
      role !== undefined &&
      (!Number.isInteger(role) || role < 0))
  ) {
    res.status(400).json({
      error: "Ange ett giltigt namn, e-post och roll",
    });
    return;
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      `UPDATE users
       SET name = ?, email = ?, role = ?
       WHERE userId = ?`,
      [name.trim(), email.trim(), role ?? null, userId]
    );

    if (result.affectedRows === 0) {
      const [rows] = await db.query<User[]>(
        "SELECT userId FROM users WHERE userId = ?",
        [userId]
      );

      if (rows.length === 0) {
        res.status(404).json({ error: "Användaren hittades inte" });
        return;
      }
    }

    res.json({ message: "Användaren har uppdaterats" });
  } catch (error) {
    console.error("Kunde inte uppdatera användaren:", error);
    res.status(500).json({ error: "Kunde inte uppdatera användaren" });
  }
});

// POST  Skapa en ny användare
router.post("/", async (req, res) => {
  const { name, email, password } = req.body;

  if (
    typeof name !== "string" ||
    !name.trim() ||
    typeof email !== "string" ||
    !email.trim() ||
    typeof password !== "string" ||
    password.length < 8
  ) {
    res.status(400).json({
      error: "Namn och e-post måste anges. Lösenordet måste vara minst 8 tecken.",
    });
    return;
  }

  try {
    const [existingUsers] = await db.query<User[]>(
      "SELECT userId FROM users WHERE email = ?",
      [email.trim()]
    );

    if (existingUsers.length > 0) {
      res.status(409).json({ error: "E-postadressen används redan" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Ingen roll tas emot från klienten vid registrering.
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, ?)`,
      [name.trim(), email.trim(), hashedPassword, null]
    );

    res.status(201).json({
      message: "Användaren har skapats",
      user: {
        userId: result.insertId,
        name: name.trim(),
        email: email.trim(),
        role: null,
      },
    });
  } catch (error) {
    console.error("Kunde inte skapa användaren:", error);
    res.status(500).json({ error: "Kunde inte skapa användaren" });
  }
});

// DELETE  Ta bort en användare
router.delete("/:id", async (req, res) => {
  const userId = Number(req.params.id);

  if (!Number.isInteger(userId) || userId <= 0) {
    res.status(400).json({ error: "Ogiltigt användar-ID" });
    return;
  }

  try {
    const [result] = await db.query<ResultSetHeader>(
      "DELETE FROM users WHERE userId = ?",
      [userId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ error: "Användaren hittades inte" });
      return;
    }

    res.json({ message: "Användaren har tagits bort" });
  } catch (error) {
    console.error("Kunde inte ta bort användaren:", error);
    res.status(500).json({ error: "Kunde inte ta bort användaren" });
  }
});

export default router;
