import { Router } from "express";
import type { TicketType } from "../types/ticketType.js";
import type { ResultSetHeader } from "mysql2";
import db from "../db.js";


const router = Router();


// Hämtar 