
import { Router, type Request, type Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../db.js';

const router = Router();

interface EventCategoryRow extends RowDataPacket {
  categoryId: number;
  name: string;
}

interface CreateEventCategoryBody {
  name?: unknown;
}

interface UpdateEventCategoryBody {
  name?: unknown;
}

interface CategoryIdParams {
  categoryId: string;
}

// Kontrollerar att värdet är en giltig kategoritext
function isValidCategoryName(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    value.trim() !== ''
  );
}

// 1. GET /api/eventcategory hämtar alla kategorier
router.get(
  '/',
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const [rows] = await db.query<EventCategoryRow[]>(
        'SELECT categoryId, name FROM eventcategory'
      );

      res.json(rows);
    } catch (error: unknown) {
      console.error('Kunde inte hämta eventkategorier:', error);
      res.status(500).json({
        error: 'Kunde inte hämta eventkategorier'
      });
    }
  }
);

// 2. GET /api/eventcategory/:categoryId hämtar en kategori
router.get(
  '/:categoryId',
  async (
    req: Request<CategoryIdParams>,
    res: Response
  ): Promise<void> => {
    const categoryId = Number(req.params.categoryId);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      res.status(400).json({ error: 'Ogiltigt categoryId' });
      return;
    }

    try {
      const [rows] = await db.query<EventCategoryRow[]>(
        'SELECT categoryId, name FROM eventcategory WHERE categoryId = ?',
        [categoryId]
      );

      const category = rows[0];

      if (!category) {
        res.status(404).json({
          error: 'Kategorin hittades inte'
        });
        return;
      }

      res.json(category);
    } catch (error: unknown) {
      console.error('Kunde inte hämta eventkategori:', error);
      res.status(500).json({
        error: 'Kunde inte hämta eventkategorin'
      });
    }
  }
);

// 3. POST /api/eventcategory skapar en ny kategori
router.post(
  '/',
  async (
    req: Request<Record<string, never>, unknown, CreateEventCategoryBody>,
    res: Response
  ): Promise<void> => {
    const { name } = req.body;

    if (!isValidCategoryName(name)) {
      res.status(400).json({
        error: 'Kategorinamnet måste anges'
      });
      return;
    }

    try {
      const [result] = await db.query<ResultSetHeader>(
        'INSERT INTO eventcategory (name) VALUES (?)',
        [name.trim()]
      );

      res.status(201).json({
        message: 'Kategorin skapades',
        categoryId: result.insertId,
        name: name.trim()
      });
    } catch (error: unknown) {
      console.error('Kunde inte skapa eventkategori:', error);
      res.status(500).json({
        error: 'Kunde inte skapa eventkategori'
      });
    }
  }
);

// 4. PUT /api/eventcategory/:categoryId uppdaterar en kategori
router.put(
  '/:categoryId',
  async (
    req: Request<CategoryIdParams, unknown, UpdateEventCategoryBody>,
    res: Response
  ): Promise<void> => {
    const categoryId = Number(req.params.categoryId);
    const { name } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      res.status(400).json({ error: 'Ogiltigt categoryId' });
      return;
    }

    if (!isValidCategoryName(name)) {
      res.status(400).json({
        error: 'Kategorinamnet måste anges'
      });
      return;
    }

    try {
      const [result] = await db.query<ResultSetHeader>(
        'UPDATE eventcategory SET name = ? WHERE categoryId = ?',
        [name.trim(), categoryId]
      );

      if (result.affectedRows === 0) {
        const [rows] = await db.query<EventCategoryRow[]>(
          'SELECT categoryId FROM eventcategory WHERE categoryId = ?'
        , [categoryId]);

        if (rows.length === 0) {
          res.status(404).json({
            error: 'Kategorin hittades inte'
          });
          return;
        }
      }

      res.json({
        message: 'Kategorin uppdaterades',
        categoryId,
        name: name.trim()
      });
    } catch (error: unknown) {
      console.error('Kunde inte uppdatera eventkategori:', error);
      res.status(500).json({
        error: 'Kunde inte uppdatera eventkategori'
      });
    }
  }
);

// 5. DELETE /api/eventcategory/:categoryId tar bort en kategori
router.delete(
  '/:categoryId',
  async (
    req: Request<CategoryIdParams>,
    res: Response
  ): Promise<void> => {
    const categoryId = Number(req.params.categoryId);

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      res.status(400).json({ error: 'Ogiltigt categoryId' });
      return;
    }

    try {
      const [result] = await db.query<ResultSetHeader>(
        'DELETE FROM eventcategory WHERE categoryId = ?',
        [categoryId]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({
          error: 'Kategorin hittades inte'
        });
        return;
      }

      res.json({
        message: `Kategorin med id ${categoryId} togs bort`
      });
    } catch (error: unknown) {
      console.error('Kunde inte ta bort eventkategori:', error);
      res.status(500).json({
        error: 'Kunde inte ta bort eventkategori'
      });
    }
  }
);

export default router;
