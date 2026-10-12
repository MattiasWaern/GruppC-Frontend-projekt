import { Router } from "express";
import type { RowDataPacket, ResultSetHeader } from "mysql2";
import db from "../db.js";
import type { User } from "../types/user.js";

const router = Router();