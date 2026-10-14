import { Router } from "express";
import bcrypt from "bcrypt";
import db from "../db.js";
import type { User } from "../types/user.js";

const router = Router();


// POST /api/auth/login)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (typeof email !== "string" || typeof password !== "string") {
    res.status(400).json({ error: "Ange e-post och lösenord" });
    return;
  }

  try {
    const [rows] = await db.query<User[]>(
      "SELECT userId, name, email, password, role FROM users WHERE email = ?",
      [email.trim()]
    );

    const user = rows[0];
    const ok = user && await bcrypt.compare(password, user.password);

    if (!ok) {
      res.status(401).json({ error: "Fel e-post eller lösenord" });
      return;
    }

    // token JWT eller en session...
    res.json({ userId: user.userId, name: user.name, role: user.role });
  } catch (error) {
    console.error("Inloggning misslyckades:", error);
    res.status(500).json({ error: "Inloggning misslyckades" });
  }
});

export default router;

