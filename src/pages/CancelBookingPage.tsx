import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation } from "react-router";

type Status = "form" | "loading" | "done";

interface PrefillState {
  email?: string;
  bookingNumber?: string;
}

export default function CancelBookingPage() {
   // Värden som kan skickas med från bokningsbekräftelsen
  const location = useLocation();
  const prefill = location.state as PrefillState | null;

  const [email, setEmail] = useState(prefill?.email ?? "");
  const [bookingNumber, setBookingNumber] = useState(
    prefill?.bookingNumber ?? ""
  );
  const [status, setStatus] = useState<Status>("form");
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const response = await fetch("/api/bookings", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          booking_number: bookingNumber.trim().toUpperCase(),
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);

        throw new Error(
          data?.error ?? "Kunde inte avboka bokningen."
        );
      }

      setStatus("done");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Kunde inte nå servern. Försök igen."
      );
      setStatus("form");
    }
  }

  return (
    <section className="flex min-h-[75vh] items-center justify-center px-2 py-12 font-sans text-[#e4ce83] sm:px-4">
      <div className="w-full max-w-md">

        {/* Sidhuvud */}
        <div className="mb-8 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#c9a75b]">
            Filmvisarna
          </p>

          <h1 className="font-serif text-4xl text-[#f1e3be]">
            Avboka biljetter
          </h1>

          <p className="mt-3 text-sm leading-relaxed text-[#aaa59b]">
            Har dina planer ändrats? Här kan du enkelt
            avboka din reservation.
          </p>
        </div>

        {/* Kort */}
        <div className="overflow-hidden rounded-2xl border border-[#6c5a31]/50 bg-[#1b1b1b] shadow-2xl">

          {status === "done" ? (
            <div className="flex flex-col items-center px-6 py-10 text-center sm:px-10">

              {/* Bekräftelseikon */}
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-[#b99b4c]/50 bg-[#b99b4c]/10">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-8 w-8 text-[#e5ca7a]"
                  aria-hidden="true"
                >
                  <path d="m5 12 4 4L19 6" />
                </svg>
              </div>

              <h2 className="mb-3 font-serif text-2xl text-[#f1e3be]">
                Bokningen är avbokad
              </h2>

              <p className="mb-3 text-sm leading-relaxed text-[#aaa59b]">
                Din bokning har avbokats och platserna
                har blivit tillgängliga igen.
              </p>

              <div className="my-5 w-full rounded-xl border border-[#6c5a31]/40 bg-[#252525] p-4">
                <p className="mb-1 text-xs uppercase tracking-wider text-[#aaa59b]">
                  Avbokat bokningsnummer
                </p>

                <p className="font-mono text-lg font-semibold tracking-wider text-[#e5ca7a]">
                  {bookingNumber.trim().toUpperCase()}
                </p>
              </div>

              <p className="mb-8 text-sm text-[#aaa59b]">
                Vi hoppas få välkomna dig till Filmvisarna
                vid ett annat tillfälle.
              </p>

              <div className="flex w-full flex-col gap-3">
                <Link
                  to="/movies"
                  className="rounded-lg bg-[#d7b83e] px-5 py-3 text-center text-sm font-semibold text-[#181818] transition hover:bg-[#ebd05c]"
                >
                  Utforska filmer
                </Link>

                <Link
                  to="/"
                  className="rounded-lg border border-[#6c5a31] px-5 py-3 text-center text-sm text-[#e5ca7a] transition hover:border-[#b99b4c] hover:bg-[#292929]"
                >
                  Till startsidan
                </Link>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="space-y-6 p-6 sm:p-10"
            >

              {/* Information */}
              <div className="rounded-xl border border-[#6c5a31]/40 bg-[#252525] p-4">
                <div className="flex items-start gap-3">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5 h-5 w-5 shrink-0 text-[#c9a75b]"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 11v5" />
                    <path d="M12 8h.01" />
                  </svg>

                  <p className="text-sm leading-relaxed text-[#bcb6aa]">
                    Ange e-postadressen och bokningsnumret
                    som användes vid bokningen för att
                    avboka dina biljetter.
                  </p>
                </div>
              </div>

              {/* E-post */}
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm text-[#e4ce83]"
                >
                  E-postadress
                </label>

                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  disabled={status === "loading"}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="namn@exempel.se"
                  className="w-full rounded-lg border border-[#6c5a31]/50 bg-[#292929] px-4 py-3 text-sm text-white outline-none transition placeholder:text-[#777] focus:border-[#d7b83e] disabled:opacity-60"
                />
              </div>

              {/* Bokningsnummer */}
              <div>
                <label
                  htmlFor="bookingNumber"
                  className="mb-2 block text-sm text-[#e4ce83]"
                >
                  Bokningsnummer
                </label>

                <input
                  id="bookingNumber"
                  type="text"
                  required
                  disabled={status === "loading"}
                  value={bookingNumber}
                  onChange={(e) =>
                    setBookingNumber(e.target.value)
                  }
                  placeholder="FV-XXXXX"
                  className="w-full rounded-lg border border-[#6c5a31]/50 bg-[#292929] px-4 py-3 font-mono text-sm uppercase tracking-wider text-white outline-none transition placeholder:text-[#777] focus:border-[#d7b83e] disabled:opacity-60"
                />

                <p className="mt-2 text-xs text-[#88847d]">
                  Du hittar bokningsnumret i din
                  bokningsbekräftelse.
                </p>
              </div>

              {/* Felmeddelande */}
              {error && (
                <div
                  role="alert"
                  className="rounded-lg border border-red-900/60 bg-red-950/20 p-4 text-sm text-red-300"
                >
                  {error}
                </div>
              )}

              {/* Avboka */}
              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full cursor-pointer rounded-lg bg-[#d7b83e] px-5 py-3 font-semibold text-[#181818] transition hover:bg-[#ebd05c] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "loading"
                  ? "Avbokar..."
                  : "Bekräfta avbokning"}
              </button>

              <div className="border-t border-[#6c5a31]/40 pt-5 text-center">
                <Link
                  to="/movies"
                  className="text-sm text-[#aaa59b] transition hover:text-[#e5ca7a]"
                >
                  Ångrat dig? Tillbaka till filmer
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
