export interface SeatHold {
    holdId: number;
    holdToken: string;
    viewingId: number;
    seatId: number;
    expiresAt: Date;
}

export type SeatStatus = "free" | "held" | "booked";

export interface SeatWithStatus {
    seatId: number;
    row: number;
    seatnumber: number;
    status: SeatStatus;
    mine: boolean;
}