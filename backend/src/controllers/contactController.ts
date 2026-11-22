import { Request, Response } from "express";
import { sendContactEmail } from "../email.js";

export async function handleContactForm(req: Request, res: Response) {
const { name, email, subject, message } = req.body;
// Plockar ut de fyra fälten som frontend skickar från formuläret.

if (!name || !email || !subject || !message) {
res.status(400).json({ error: "Fyll i alla fält" });
return;
}
// Stoppar om något fält är tomt och svarar med felkod 400.

try {
await sendContactEmail({ name, email, subject, message });
res.status(200).json({ message: "Meddelandet skickades" });
} catch (error) {
console.error("Kunde inte skicka kontaktmeddelandet:", error);
res.status(500).json({ error: "Kunde inte skicka meddelandet" });
}
// Skickar mailet. Går det bra svarar vi 200, annars loggas felet
// i terminalen och frontend får felkod 500.
}