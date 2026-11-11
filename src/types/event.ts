export interface Event {
    eventId: number;
    title: string;
    date: string;
    description: string | null;
    poster: string | null;
    categoryId: number;
    categoryName: string;
    extraInfo: string | null;
}