export interface Viewing {
    viewingId: number;
    viewing: string;
    viewing_date: Date;
    viewing_start_time: string;
    movieId: number | null;
    eventId: number | null;
    theaterId: number | null;
}
