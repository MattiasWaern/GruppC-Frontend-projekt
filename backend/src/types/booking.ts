export interface Booking {
    bookingId: number
    userId: number
    viewingId: number
    booking_number: string
    booking_confirmation: string
    booking_date: string
    seats: string
}

export interface NewBooking {
    userId: number
    viewingId: number
    seatIds: number[]
}