import nodemailer from "nodemailer";

interface BookingEmail {
  to: string;
  bookingNumber: string;
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

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secureValue === "true",
    auth: { user, pass: password },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM?.trim() || user,
    to,
    subject: "Bokningsbekräftelse",
    text: `Tack för din bokning! Ditt bokningsnummer är ${bookingNumber}.`,
  });
}
