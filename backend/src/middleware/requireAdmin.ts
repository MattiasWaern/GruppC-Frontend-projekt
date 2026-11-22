import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import pool from "../db.js";

const ADMIN_ROLES = [3, 4];

export const requireAdmin: RequestHandler = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ message: "Du måste vara inloggad." });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);

    if (typeof decoded === "string" || typeof decoded.userId !== "number") {
      res.status(401).json({ message: "Ogiltig token." });
      return;
    }

    const [rows] = await pool.query<any[]>(
      "SELECT role FROM users WHERE userId = ?",
      [decoded.userId]
    );

    const role = rows[0]?.role;

    if (!ADMIN_ROLES.includes(role)) {
      res.status(403).json({ message: "Du saknar administratörsbehörighet." });
      return;
    }

    next();
  } catch {
    res.status(401).json({ message: "Ogiltig eller utgången token." });
  }
};