import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken"
import db from "../db.js";
import type { ResultSetHeader } from "mysql2";
import type { User } from "../types/user.js";
import { error } from "console";

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET;

if(!JWT_SECRET){
  throw new Error("JWT_SECRET saknas i .env")
}

const secret : string = JWT_SECRET;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body ?? {};

  if (
    typeof name !== "string" ||
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    res.status(400).json({
      error: "Namn, e-post och lösenord krävs.",
    });
    return;
  }

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();

  if (
    cleanName.length < 2 ||
    cleanName.length > 100 ||
    cleanEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
    password.length < 8 ||
    Buffer.byteLength(password, "utf8") > 72
  ) {
    res.status(400).json({
      error: "Kontrollera namn, e-post och lösenord. Lösenordet måste vara minst 8 tecken.",
    });
    return;
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 12);

    // Anpassa role-värdet till er databas.
    // Här används NULL som standard för nya konton.
    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO users (name, email, password, role)
       VALUES (?, ?, ?, NULL)`,
      [cleanName, cleanEmail, hashedPassword]
    );

    res.status(201).json({
      message: "Kontot har skapats!",
      userId: result.insertId,
    });
  } catch (error) {
    // MySQL: Duplicate entry
    if (
      error instanceof Error &&
      "code" in error &&
      error.code === "ER_DUP_ENTRY"
    ) {
      res.status(409).json({
        error: "E-postadressen används redan.",
      });
      return;
    }

    console.error("Registrering misslyckades:", error);
    res.status(500).json({
      error: "Kunde inte skapa kontot.",
    });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body ?? {};

  if (
    typeof email !== "string" ||
    typeof password !== "string"
  ) {
    res.status(400).json({
      error: "Ange e-post och lösenord.",
    });
    return;
  }

  try {
    const [rows] = await db.query<User[]>(
      `SELECT userId, name, email, password, role
       FROM users
       WHERE email = ?`,
      [email.trim().toLowerCase()]
    );

    const user = rows[0];

    const validPassword = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !validPassword) {
      res.status(401).json({
        error: "Fel e-post eller lösenord.",
      });
      return;
    }

    const token = jwt.sign(
      {
        userId: user.userId,
        role: user.role,
      },
      secret,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Inloggningen lyckades!",
      token,
      user: {
        userId: user.userId,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Inloggning misslyckades:", error);
    res.status(500).json({
      error: "Inloggning misslyckades.",
    });
  }
});

export default router;