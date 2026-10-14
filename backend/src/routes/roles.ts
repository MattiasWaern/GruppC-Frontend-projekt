import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../db.js";

const router = Router();

interface RoleRow extends RowDataPacket {
  rolesId: number;
  user: string | null;
  guest: string | null;
  admin: string | null;
  productOwner: string | null;
}

router.get("/", async (_req, res) => {
  try {
    const [rows] = await db.query<RoleRow[]>(`
      SELECT *
      FROM roles
      ORDER BY rolesId
      `);
    res.json(rows);
  } catch (error) {
    console.error("Kunde inte hämta roller:", error);

    res.status(500).json({
      error: "Kunde inte hämta roller",
    });
  }
});

router.get("/:id", async (req, res) => {
  const rolesId = Number(req.params.id);

  if (!Number.isInteger(rolesId) || rolesId <= 0) {
    res.status(400).json({
      error: "Ogiltigt roll-ID",
    });
    return;
  }
  try {
    const [rows] = await db.query<RoleRow[]>(
      `
      SELECT *
      FROM roles
      WHERE rolesId = ?
      `,
      [rolesId]
    );

    if (rows.length === 0) {
      res.status(404).json({
        error: "Rollen hittades inte",
      });
      return;
    }
    res.json(rows[0]);
  } catch (error) {
    console.error("Kunde inte hämta rollen:", error);

    res.status(500).json({
      error: "Kunde inte hämta rollen",
    });
  }
});

router.post("/", async (req, res) => {
  const { rolesId, user, guest, admin, productOwner } = req.body;

  if (
    !Number.isInteger(rolesId) ||
    rolesId
    <= 0 ||
    ![user, guest, admin, productOwner].every(
      (value) =>
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 100)
    )
  ) {
    res.status(400).json({
      error: "Ogiltiga rolluppgifter",
    });
    return;
  }

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `
      INSERT INTO roles
      (rolesId, \`user\`, guest, admin, productOwner)
      VALUES (?, ?, ?, ?, ?)
      `,
      [
        rolesId,
        user ?? null,
        guest ?? null,
        admin ?? null,
        productOwner ?? null,
      ]
    );

    res.status(201).json({
      message: "Rollen skapades",
      rolesId: result.insertId || rolesId,
    });
  } catch (error) {
    console.error("Kunde inte skapa rollen:", error);

    res.status(500).json({
      error: "Kunde inte skapa rollen",
    });
  }
});
router.put("/:id", async (req, res) => {
  const rolesId = Number(req.params.id);
  const { user, guest, admin, productOwner } = req.body;

  if (!Number.isInteger(rolesId) || rolesId <= 0) {
    res.status(400).json({
      error: "Ogiltig roll-ID",
    });
    return;
  }
  if (
    ![user, guest, admin, productOwner].every(
      (value) =>
        value === null ||
        value === undefined ||
        (typeof value === "string" && value.length <= 100)
    )
  ) {
    res.status(400).json({
      error: "Ogiltiga rolluppgifter",
    });
    return;
  }

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `
      UPDATE roles
      SET \`user\` = ?,
          guest = ?,
          admin = ?,
          productOwner = ?
      WHERE rolesId = ?
      `,
      [
        user ?? null,
        guest ?? null,
        admin ?? null,
        productOwner ?? null,
        rolesId
      ]
    );
    if (result.affectedRows === 0) {
      const [rows] = await db.query<RoleRow[]>(
        "SELECT rolesId FROM roles WHERE rolesId = ?",
        [rolesId]
      );
      if (rows.length === 0) {
        res.status(404).json({
          error: "Rollen hittades inte",
        });
        return;
      }
    }
    
    res.json({
      message: "Rollen uppdaterades",
    });
  } catch (error) {
    console.error("Kunde inte uppdatera rollen", error);
    res.status(500).json({
      error: "Kunde inte uppdatera rollen",
    });
  }
});

router.delete("/:id", async (req, res) => {
  const rolesId = Number(req.params.id);

  if (!Number.isInteger(rolesId) || rolesId <= 0) {
    res.status(400).json({
      error: "Ogiltigt roll-ID",
    });
    return;
  }

  try {
    const [result] = await db.execute<ResultSetHeader>(
      `
      DELETE FROM roles
      WHERE rolesId = ?
      `,
      [rolesId]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({
        error: "Rollen hittades inte",
      });
      return;
    }

    res.status(204).send();
  } catch (error) {
    console.error("Kunde inte ta bort rollen:", error);

    res.status(500).json({
      error: "Kunde inte ta bort rollen",
    });
  }
});

export default router;
