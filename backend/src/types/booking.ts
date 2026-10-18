export interface Booking {
    bookingId: number;
    userId: number;
    viewingId: number;
    booking_number: string;
    booking_confirmation: string;
    booking_date: string;
}

export interface BookedSeat {
    bokadStolId: number;
    bookingId: number;
    seatId: number;
    ticketTypeId: number;
    viewingId: number;
  }
  
  export interface NewBooking {
    userId: number;
    viewingId: number;
    seats: { seatId: number; ticketTypeId: number }[];
  }