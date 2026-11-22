import type { RowDataPacket } from "mysql2";

export interface User extends RowDataPacket {
    userId: number
    name: string
    email: string
    password: string
    role: number | null;
}