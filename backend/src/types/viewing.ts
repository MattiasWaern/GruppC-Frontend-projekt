import { RowDataPacket } from "mysql2"

export interface Viewing extends RowDataPacket {
    viewing: string
    viewing_id: string
    viewing_date: Date
    viewing_start_time: string
    movieId: number
    eventId: number
    theaterId: number
}