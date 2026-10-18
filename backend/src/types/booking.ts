export interface Booking {
    bookingId: number;
    userId: number;
    viewingId: number;
    booking_number: string;
    booking_confirmation: string;
    booking_date: string;
    seats: string | null; // tas bort när kolumnen droppas (bokad_stol ersätter den)
}

export interface TicketInput {
    seatId: number;
    ticketTypeId: number;
}

export interface NewBooking {
    userId: number;
    viewingId: number;
    tickets: TicketInput[];
}