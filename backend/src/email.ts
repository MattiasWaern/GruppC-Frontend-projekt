import nodemailer from "nodemailer";
import type { ResultSetHeader, RowDataPacket } from "mysql2";
import db from "./db.js";
import { fileURLToPath } from "url";

interface BookingEmail {
  //interface för bokningsbekräftelsemail
  to: string;
  bookingNumber: string;
}
// Gör text säker att visa i HTML-mejl.
function escapeHtml(value: unknown): string {
  return String(value ?? "").replace(/[&<>"']/g, (char) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };

    return entities[char];
  });
}
// Formaterar datumet till år-månad-dag.
function formatDate(date: Date | string): string {
  if (date instanceof Date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return String(date).slice(0, 10);
}
export async function sendBookingConfirmationEmail({
  to,
  bookingNumber,
}: BookingEmail): Promise<void> {
  const host = process.env.SMTP_HOST?.trim();
  const port = Number(process.env.SMTP_PORT);
  const secureValue = process.env.SMTP_SECURE?.trim().toLowerCase();
  const user = process.env.SMTP_USER?.trim();
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

  // Hämtar information om bokningen från databasen
  const [rows] = await db.query<any[]>(
    "SELECT * FROM bookingInfo WHERE bookingNumber=?",
    [bookingNumber],
  );

  const info = rows[0];

  if (!info) {
    throw new Error("Bokningen kunde inte hittas");
  }

  const formattedDate = formatDate(info.viewingDate);

  // Hämtar antal biljetter av varje typ för bokningen
  const [ticketRows] = await db.query<any[]>(
    `SELECT
    tt.name AS ticketName,
    COUNT(*) AS ticketCount
  FROM booking b
  JOIN bokad_stol bs ON bs.bookingId = b.bookingId
  JOIN tickettype tt ON tt.ticketTypeId = bs.ticketTypeId
  WHERE b.booking_number = ?
  GROUP BY tt.ticketTypeId, tt.name
  ORDER BY tt.ticketTypeId`,
    [bookingNumber],
  );

  // Gör om resultatet till en lista med biljettfördelningen
  const ticketInfo = ticketRows.map(
    (ticket) => `${ticket.ticketName}: ${ticket.ticketCount} st`,
  );

  // Hämtar alla bokade platser
  info.seatInfo = rows.map((x: any) => `rad ${x.seatRow} stol ${x.seatNumber}`);

  delete info.seatRow;
  delete info.seatNumber;

  console.log(info);
  console.log("HTML:", Boolean(info.movieTitle));
  console.log("Platser:", info.seatInfo.join(", "));

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secureValue === "true",
    auth: { user, pass: password },
  });

  // Hämtar loggan från projektets filer.
  // email.ts ligger i backend/src/
  const logoPath = fileURLToPath(
    new URL("../../dist/images/Logo.png", import.meta.url),
  );

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || user,
    to,
    subject: "Bokningsbekräftelse",

    // HTML-versionen av bokningsbekräftelsen
    html: `
  <div style="background-color:#000000;width:100%;margin:0;padding:0;font-family:Arial,Helvetica,sans-serif;color:#eeeeee;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
    style="width:100%;background-color:#000000;border-collapse:collapse;">

      <tr>
        <td style="text-align:center;padding:30px 20px;border-bottom:1px solid #806a3e;">
          <img src="cid:filmvisarna-logo" alt="Filmvisarna" width="160"
            style="display:block;width:160px;max-width:100%;height:auto;margin:0 auto;border:0;">
        </td>
      </tr>

      <tr>
        <td style="padding:30px 30px 10px;text-align:center;">
          <h1 style="color:#d4b46a;font-size:25px;font-weight:normal;margin:0 0 15px;">
            Tack för din bokning!
          </h1>

          <p style="color:#cccccc;font-size:15px;line-height:1.6;">
            Din bioupplevelse är nu bokad.
          </p>

          <p style="color:#d4b46a;font-size:16px;margin:20px 0 0;">
            Bokningsnummer
          </p>

          <p style="color:#ffffff;font-size:22px;font-weight:bold;letter-spacing:2px;margin:8px 0 20px;">
            ${escapeHtml(bookingNumber)}
          </p>
        </td>
      </tr>

      <tr>
        <td style="padding:10px 30px 30px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
            style="background-color:#252525;border:1px solid #5e5033;border-radius:6px;">
            <tr>
              <td style="padding:20px;">
                <h2 style="color:#d4b46a;font-size:17px;font-weight:normal;margin:0 0 18px;">
                  Dina bokningsuppgifter
                </h2>

                <p style="color:#eeeeee;font-size:14px;line-height:1.7;">
                  <span style="color:#d4b46a;">Film:</span>
                  ${escapeHtml(info.movieTitle)}
                </p>

                <p style="color:#eeeeee;font-size:14px;line-height:1.7;">
                  <span style="color:#d4b46a;">Dag:</span>
                 ${escapeHtml(formattedDate)}
                </p>

                <p style="color:#eeeeee;font-size:14px;line-height:1.7;">
                  <span style="color:#d4b46a;">Tid:</span>
                  ${escapeHtml(info.viewingStartTime)}
                </p>

                <p style="color:#eeeeee;font-size:14px;line-height:1.7;">
                  <span style="color:#d4b46a;">Salong:</span>
                  ${escapeHtml(info.theaterName)}
                </p>

                <p style="color:#eeeeee;font-size:14px;line-height:1.7;">
                  <span style="color:#d4b46a;">Platser:</span>
                  ${info.seatInfo.map(escapeHtml).join(", ")}
                </p>
                <p style="color:#eeeeee;font-size:14px;line-height:1.7;">
  <span style="color:#d4b46a;">Biljetter:</span><br>
  ${ticketInfo.map(escapeHtml).join("<br>")}
</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <tr>
        <td style="text-align:center;padding:0 25px 25px;">
          <h2 style="color:#d4b46a;font-size:19px;font-weight:normal;">
            Varmt välkommen!
          </h2>

          <p style="color:#cccccc;font-size:14px;line-height:1.7;">
            Vi hoppas att du får en fantastisk bioupplevelse!
          </p>
        </td>
      </tr>

      <tr>
        <td style="border-top:1px solid #806a3e;padding:22px 25px;text-align:center;">
          <p style="color:#d4b46a;font-size:14px;">
            Avbokning kan göras fram till 60 minuter innan visningen.
          </p>
          <p style="color:#d4b46a;font-size:14px;">
            Kontakta biografen vid frågor eller om du vill avboka.
          </p>

          <p style="color:#cccccc;font-size:13px;line-height:1.8;">
            E-post: filmvisarnagruppc@gmail.com<br>
            Telefon: 08-123 456 78
          </p>

          <p style="color:#d4b46a;font-size:13px;margin-top:18px;">
            Supportens öppettider
          </p>

          <p style="color:#cccccc;font-size:13px;">
            Mån–Sön: 10:00 – 21:00
          </p>

          <p style="color:#777777;font-size:11px;margin-top:25px;">
            Tack för att du väljer Filmvisarna.
          </p>
        </td>
      </tr>

    </table>
  </div>
`,

    // Vanlig textversion för mailklienter som inte visar HTML
    text:
      `Tack för din bokning!\n\n` +
      `Ditt bokningsnummer är ${bookingNumber}.\n\n` +
      `Film: ${info.movieTitle}\n` +
      `Dag: ${formattedDate}\n` +
      `Tid: ${info.viewingStartTime}\n` +
      `Salong: ${info.theaterName}\n` +
      `Platser: ${info.seatInfo.join(", ")}\n\n` +
      `Biljetter:\n${ticketInfo.join("\n")}\n\n` +
      `Varmt välkommen!\n\n` +
      `Vid frågor, kontakta oss på:\n` +
      `E-post: filmvisarnagruppc@gmail.com\n` +
      `Telefon: 08-123 456 78\n` +
      `Öppettider support:\n` +
      `Mån–Sön: 10:00 – 21:00`,

    // Bäddar in loggan direkt i mejlet
    attachments: [
      {
        filename: "Logo.png",
        path: logoPath,
        cid: "filmvisarna-logo",
      },
    ],
  });
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
