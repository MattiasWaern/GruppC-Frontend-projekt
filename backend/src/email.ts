import nodemailer from "nodemailer";

interface BookingEmail { //interface för bokningsbekräftelsemail
  to: string;
  bookingNumber: string;
}

export async function sendBookingConfirmationEmail({ //funktion som skickar bokningsbekräftelsemail
  to,
  bookingNumber,
}: BookingEmail): Promise<void> {
 

  const host = process.env.SMTP_HOST?.trim(); // Läser in värden från .env-filen
  const port = Number(process.env.SMTP_PORT); // Konverterar porten till ett nummer
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase(); 
  const user = process.env.SMTP_USER?.trim(); // Användarnamnet för SMTP
  const password = process.env.SMTP_PASS;

  if (
    !host ||
    !Number.isInteger(port) ||
    port < 1 ||
    port > 65535 ||
    (secureValue !== "true" && secureValue !== "false") ||
    !user ||
    !password
  ) {
    throw new Error("SMTP-konfigurationen saknas eller är ogiltig");
  }
  // Kontrollerar att alla inställningar finns och är giltiga. Om något saknas stoppas funktionen med felmeddelande.

  const transporter = nodemailer.createTransport({ //Skapar anslutning till mailservern med nodemailer
    host,
    port,
    secure: secureValue === "true", //kontrollerar secure i .env-filen
    auth: { user, pass: password }, //autentisering med användarnamn och lösenord
  });

  await transporter.sendMail({ //Skickar mailet med text och bokningsnummer
    from: process.env.SMTP_FROM?.trim() || user,
    to,
    subject: "Bokningsbekräftelse",
    text: `Tack för din bokning! Ditt bokningsnummer är ${bookingNumber}.`,
  });
  //Avsändaren är SMTP_FROM om den finns, annars samma adress som loggar in.
}

interface ContactEmail {
  name: string;
  email: string;
  subject: string;
  message: string;
}
// Beskriver uppgifterna som kommer från kontaktformuläret.

export async function sendContactEmail({
  name,
  email,
  subject,
  message,
}: ContactEmail): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim();
  const password = process.env.SMTP_PASS;
  // Läser mailinställningarna från .env, precis som bokningsmailet gör.

  if (
    !host ||
    !Number.isInteger(port) ||
    (secureValue !== "true" && secureValue !== "false") ||
    !user ||
    !password
  ) {
    throw new Error("SMTP-konfigurationen saknas eller är ogiltig");
  }
  // Stoppar med ett tydligt felmeddelande om någon inställning saknas.

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secureValue === "true",
    auth: { user, pass: password },
  });
  // Skapar anslutningen till mailservern.

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || user,
    to: process.env.CONTACT_TO?.trim() || user,
    replyTo: email,
    subject: `Kontaktformulär: ${subject}`,
    text: `Från: ${name} (${email})\n\n${message}`,
  });
  // Skickar mailet till gruppens adress (CONTACT_TO i .env, annars samma
  // adress som loggar in). replyTo gör att "Svara" i mailprogrammet går
  // direkt till personen som skrev, inte till oss själva.
}