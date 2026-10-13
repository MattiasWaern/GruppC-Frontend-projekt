import type { RowDataPacket } from "mysql2"


export interface TicketType extends RowDataPacket  {
    ticketTypeId: number
    price: number
    ticket_child: number
    ticket_adult: number
    ticket_senior: number
}