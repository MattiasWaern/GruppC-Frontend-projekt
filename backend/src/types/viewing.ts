import type { RowDataPacket } from "mysql2";

export interface Viewing extends RowDataPacket {
    viewingId: number;
    viewing: string;
    viewing_date: string;
    viewing_start_time: string;
    movieId: number | null;
    eventId: number | null;
    theaterId: number | null;
}
