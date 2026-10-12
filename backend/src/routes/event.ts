
import { Router, type Request, type Response } from 'express';
import type { RowDataPacket, ResultSetHeader } from 'mysql2';
import db from '../db.js';

const router = Router();

// Typ, en rad från events tabellen
interface EventRow extends RowDataPacket {
    eventId: number;
    title: string;
    date: Date | string;
    description: string | null;
    poster: string | null;
    categoryId: number;
}

interface EventInput {
    title: string;
    date: string;
    description: string | null;
    poster: string | null;
    categoryId: number;
}

// Kontrollerar att värdet är ett objekt
function isObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object'
        && value !== null
        && !Array.isArray(value);
}

// kollar inkommande eventdata
function validateEventInput(value: unknown): EventInput | null {
    if (!isObject(value)) {
        return null;
    }

    const { title, date, description, poster, categoryId } = value;

    if (typeof title !== 'string' || title.trim() === '') {
        return null;
    }

    if (typeof date !== 'string' || date.trim() === '') {
        return null;
    }

    // Godtar datumformat som YYYY-MM-DD eller YYYY-MM-DD HH:mm:ss
    const normalizedDate = date.trim().replace('T', ' ');

    const match = normalizedDate.match(
        /^(\d{4})-(\d{2})-(\d{2})(?: (\d{2}):(\d{2}):(\d{2}))?$/
    );

    if (!match) {
        return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const hour = Number(match[4] ?? 0);
    const minute = Number(match[5] ?? 0);
    const second = Number(match[6] ?? 0);

    const calendarDate = new Date(Date.UTC(year, month - 1, day));

    if (
        calendarDate.getUTCFullYear() !== year ||
        calendarDate.getUTCMonth() !== month - 1 ||
        calendarDate.getUTCDate() !== day
    ) {
        return null;
    }

    if (hour > 23 || minute > 59 || second > 59) {
        return null;
    }

    if (
        description !== undefined &&
        description !== null &&
        typeof description !== 'string'
    ) {
        return null;
    }

    if (
        poster !== undefined &&
        poster !== null &&
        typeof poster !== 'string'
    ) {
        return null;
    }

    if (
        typeof categoryId !== 'number' ||
        !Number.isInteger(categoryId) ||
        categoryId <= 0
    ) {
        return null;
    }

    const datePart =
        `${String(year).padStart(4, '0')}-` +
        `${String(month).padStart(2, '0')}-` +
        `${String(day).padStart(2, '0')}`;

    const timePart =
        `${String(hour).padStart(2, '0')}:` +
        `${String(minute).padStart(2, '0')}:` +
        `${String(second).padStart(2, '0')}`;

    return {
        title: title.trim(),
        date: `${datePart} ${timePart}`,
        description: typeof description === 'string' ? description : null,
        poster: typeof poster === 'string' ? poster : null,
        categoryId
    };
}

// 1. GET /api/events - Hämta alla events
router.get('/', async (_req: Request, res: Response): Promise<void> => {
    try {
        const [rows] = await db.query<EventRow[]>(
            `SELECT eventId, title, date, description, poster, categoryId
             FROM events`
        );

        res.json(rows);
    } catch (error: unknown) {
        console.error('Kunde inte hämta events:', error);
        res.status(500).json({ error: 'Kunde inte hämta events' });
    }
});

// 2. GET /api/events/:eventId - Hämta ett event
router.get(
    '/:eventId',
    async (
        req: Request<{ eventId: string }>,
        res: Response
    ): Promise<void> => {
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            res.status(400).json({ error: 'Ogiltigt eventId' });
            return;
        }

        try {
            const [rows] = await db.query<EventRow[]>(
                `SELECT eventId, title, date, description, poster, categoryId
                 FROM events
                 WHERE eventId = ?`,
                [eventId]
            );

            const event = rows[0];

            if (!event) {
                res.status(404).json({ error: 'Eventet hittades inte' });
                return;
            }

            res.json(event);
        } catch (error: unknown) {
            console.error('Kunde inte hämta event:', error);
            res.status(500).json({ error: 'Kunde inte hämta eventet' });
        }
    }
);

// 3. POST /api/events - Skapa ett nytt event
router.post(
    '/',
    async (
        req: Request<Record<string, never>, unknown, unknown>,
        res: Response
    ): Promise<void> => {
        const event = validateEventInput(req.body);

        if (!event) {
            res.status(400).json({
                error: 'Ogiltiga uppgifter. Kontrollera titel, datum och categoryId.'
            });
            return;
        }

        try {
            const [result] = await db.query<ResultSetHeader>(
                `INSERT INTO events
                 (title, date, description, poster, categoryId)
                 VALUES (?, ?, ?, ?, ?)`,
                [
                    event.title,
                    event.date,
                    event.description,
                    event.poster,
                    event.categoryId
                ]
            );

            res.status(201).json({
                message: 'Eventet skapades',
                eventId: result.insertId
            });
        } catch (error: unknown) {
            console.error('Kunde inte skapa event:', error);
            res.status(500).json({ error: 'Kunde inte skapa event' });
        }
    }
);

// 4. PUT /api/events/:eventId - Uppdatera ett event
router.put(
    '/:eventId',
    async (
        req: Request<{ eventId: string }, unknown, unknown>,
        res: Response
    ): Promise<void> => {
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            res.status(400).json({ error: 'Ogiltigt eventId' });
            return;
        }

        const event = validateEventInput(req.body);

        if (!event) {
            res.status(400).json({
                error: 'Ogiltiga uppgifter. Kontrollera titel, datum och categoryId.'
            });
            return;
        }

        try {
            const [result] = await db.query<ResultSetHeader>(
                `UPDATE events
                 SET title = ?, date = ?, description = ?, poster = ?, categoryId = ?
                 WHERE eventId = ?`,
                [
                    event.title,
                    event.date,
                    event.description,
                    event.poster,
                    event.categoryId,
                    eventId
                ]
            );

            if (result.affectedRows === 0) {
                const [rows] = await db.query<EventRow[]>(
                    'SELECT eventId FROM events WHERE eventId = ?',
                    [eventId]
                );

                if (rows.length === 0) {
                    res.status(404).json({ error: 'Eventet hittades inte' });
                    return;
                }
            }

            res.json({
                message: `Eventet med id ${eventId} uppdaterades`
            });
        } catch (error: unknown) {
            console.error('Kunde inte uppdatera event:', error);
            res.status(500).json({ error: 'Kunde inte uppdatera event' });
        }
    }
);

// 5. DELETE /api/events/:eventId - Ta bort ett event
router.delete(
    '/:eventId',
    async (
        req: Request<{ eventId: string }>,
        res: Response
    ): Promise<void> => {
        const eventId = Number(req.params.eventId);

        if (!Number.isInteger(eventId) || eventId <= 0) {
            res.status(400).json({ error: 'Ogiltigt eventId' });
            return;
        }

        try {
            const [result] = await db.query<ResultSetHeader>(
                'DELETE FROM events WHERE eventId = ?',
                [eventId]
            );

            if (result.affectedRows === 0) {
                res.status(404).json({ error: 'Eventet hittades inte' });
                return;
            }

            res.json({
                message: `Eventet med id ${eventId} togs bort`
            });
        } catch (error: unknown) {
            console.error('Kunde inte ta bort event:', error);
            res.status(500).json({ error: 'Kunde inte ta bort event' });
        }
    }
);

export default router;
