import type { RowDataPacket } from "mysql2"


export interface tickettype extends RowDataPacket  {
    ticketTypeId: number
    price: number
    name: string
}