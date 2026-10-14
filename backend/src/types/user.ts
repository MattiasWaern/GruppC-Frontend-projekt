import type { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
    userId: number
    email: string
    password: string
    role: number | null;
}