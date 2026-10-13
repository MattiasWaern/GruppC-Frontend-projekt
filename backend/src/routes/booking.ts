import { Router } from "express";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "../db.js";
import type { Booking, NewBooking } from "../types/booking.js";

const router = Router();

interface BookingRow extends Booking, RowDataPacket {}



export default router;