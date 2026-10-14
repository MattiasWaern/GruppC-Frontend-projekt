import { RowDataPacket } from "mysql2"

export interface Seats extends RowDataPacket {
    seatId: number
    theaterId: number
    row: number
    seatnumber: number
}