export interface Booking {
    bookingId: number;
    booking_number: string;
    booking_confirmation: string;
    booking_date: string;
    userId: number;
    seats: string;
    viewingId: number;
}

export interface NewBooking {
    userId: number;
    viewingId: number;
    seatIds: number[];
}
