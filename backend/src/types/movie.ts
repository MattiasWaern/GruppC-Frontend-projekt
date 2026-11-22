import { RowDataPacket } from "mysql2"

export interface Movie extends RowDataPacket {
    movieId: number
    title: string
    description: string
    duration_minutes: number
    trailer: string | null
    poster: string | null
    background_color: string
    age_limit: number
    genres: string[] | null

    director: string | null
    actors: string | null
    original_title: string | null
    original_language: string | null
    premiere: string | null

}