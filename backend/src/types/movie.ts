import { RowDataPacket } from "mysql2"

export interface Movie extends RowDataPacket {
    movieId: number
    title: string
    description: string
    duration_minutes: number
    trailer: string
    cover_picture: string
    background_color: string
    age_limit: number
    genres: string[] | null;
}