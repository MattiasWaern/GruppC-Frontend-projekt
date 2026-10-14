
import { Router, type Request, type Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../db.js';

const router = Router();

// Typ rad från eventcategory tabellen
interface EventCategoryRow extends RowDataPacket {
  eventId: number;
  categoryId: number;
}

// Typer för inkommande request 
interface CreateEventCategoryBody {
  eventId?: unknown;
  categoryId?: unknown;
}

interface UpdateEventCategoryBody {
  eventId?: unknown;
  newCategoryId?: unknown;
}

interface DeleteEventCategoryBody {
  eventId?: unknown;
}

interface CategoryIdParams {
  categoryId: string;
}

// Kontrollerar att värdet är ett positivt heltal
function isPositiveInteger(value: unknown): value is number {
  return (
    typeof value === 'number' &&
    Number.isInteger(value) &&
    value > 0
  );
}

// 1. GET /api/eventcategory hämtar alla kopplingar mellan kategori och event
router.get(
  '/',
  async (_req: Request, res: Response): Promise<void> => {
    try {
      const [rows] = await db.query<EventCategoryRow[]>(
        'SELECT eventId, categoryId FROM eventcategory'
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

// 2. GET /api/eventcategory/:categoryId hämtar alla eventkopplingar för en kategori
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
        'SELECT eventId, categoryId FROM eventcategory WHERE categoryId = ?',
        [categoryId]
      );

      if (rows.length === 0) {
        res.status(404).json({
          error: 'Inga kopplingar hittades för denna kategori'
        });
        return;
      }

      res.json(rows);
    } catch (error: unknown) {
      console.error('Kunde inte hämta eventkategori:', error);
      res.status(500).json({
        error: 'Kunde inte hämta eventkategorin'
      });
    }
  }
);

// 3. POST /api/eventcategory koppla ett event till en kategori
router.post(
  '/',
  async (
    req: Request<Record<string, never>, unknown, CreateEventCategoryBody>,
    res: Response
  ): Promise<void> => {
    const { eventId, categoryId } = req.body;

    if (
      !isPositiveInteger(eventId) ||
      !isPositiveInteger(categoryId)
    ) {
      res.status(400).json({
        error: 'eventId och categoryId måste vara positiva heltal'
      });
      return;
    }

    try {
      await db.query<ResultSetHeader>(
        'INSERT INTO eventcategory (eventId, categoryId) VALUES (?, ?)',
        [eventId, categoryId]
      );

      res.status(201).json({
        message: 'Kopplade event till kategori framgångsrikt',
        eventId,
        categoryId
      });
    } catch (error: unknown) {
      console.error('Kunde inte skapa koppling:', error);
      res.status(500).json({
        error: 'Kunde inte skapa koppling'
      });
    }
  }
);

// 4. PUT /api/eventcategory/:categoryId byt kategori för ett event
router.put(
  '/:categoryId',
  async (
    req: Request<CategoryIdParams, unknown, UpdateEventCategoryBody>,
    res: Response
  ): Promise<void> => {
    const categoryId = Number(req.params.categoryId);
    const { eventId, newCategoryId } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      res.status(400).json({ error: 'Ogiltigt categoryId' });
      return;
    }

    if (
      !isPositiveInteger(eventId) ||
      !isPositiveInteger(newCategoryId)
    ) {
      res.status(400).json({
        error: 'eventId och newCategoryId måste vara positiva heltal'
      });
      return;
    }

    try {
      const [result] = await db.query<ResultSetHeader>(
        `UPDATE eventcategory
         SET categoryId = ?
         WHERE eventId = ? AND categoryId = ?`,
        [newCategoryId, eventId, categoryId]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({
          error: 'Kopplingen hittades inte'
        });
        return;
      }

      res.json({
        message: 'Uppdaterade kategori för eventet',
        eventId,
        categoryId: newCategoryId
      });
    } catch (error: unknown) {
      console.error('Kunde inte uppdatera koppling:', error);
      res.status(500).json({
        error: 'Kunde inte uppdatera koppling'
      });
    }
  }
);

// 5. DELETE /api/eventcategory/:categoryId ta bort kopplongar mellan en kategori och ett event
router.delete(
  '/:categoryId',
  async (
    req: Request<CategoryIdParams, unknown, DeleteEventCategoryBody>,
    res: Response
  ): Promise<void> => {
    const categoryId = Number(req.params.categoryId);
    const { eventId } = req.body;

    if (!Number.isInteger(categoryId) || categoryId <= 0) {
      res.status(400).json({ error: 'Ogiltigt categoryId' });
      return;
    }

    if (!isPositiveInteger(eventId)) {
      res.status(400).json({
        error: 'eventId måste vara ett positivt heltal'
      });
      return;
    }

    try {
      const [result] = await db.query<ResultSetHeader>(
        'DELETE FROM eventcategory WHERE categoryId = ? AND eventId = ?',
        [categoryId, eventId]
      );

      if (result.affectedRows === 0) {
        res.status(404).json({
          error: 'Kopplingen hittades inte'
        });
        return;
      }

      res.json({
        message: `Tog bort kopplingen för kategori ${categoryId}`
      });
    } catch (error: unknown) {
      console.error('Kunde inte ta bort koppling:', error);
      res.status(500).json({
        error: 'Kunde inte ta bort koppling'
      });
    }
  }
);

export default router;
