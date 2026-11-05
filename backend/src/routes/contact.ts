import { Router } from "express";
import { handleContactForm } from "../controllers/contactController.js";

const router = Router();
// Skapar en router för kontakt-rutterna.

router.post("/", handleContactForm);
// POST /api/contact (prefixet sätts i server.ts) skickas till controllern.

export default router;
// Gör routern tillgänglig så server.ts kan koppla in den.
