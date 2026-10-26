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
    const [bookingNumber, setBookingNumber] = useState(prefill?.bookingNumber ?? "");
    const [status, setStatus] = useState<Status>("form");
    const [error, setError] = useState("");
  
    async function handleSubmit(e: FormEvent) {
      e.preventDefault();
      setError("");
      setStatus("loading");
  
      try {
        const res = await fetch("/api/bookings", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: email.trim(),
              booking_number: bookingNumber.trim().toUpperCase(),
            }),
          });
  
        if (!res.ok) {
          const data = await res.json().catch(() => null);
          setError(data?.error ?? "Något gick fel, försök igen");
          setStatus("form");
          return;
        }
  
        setStatus("done");
      } catch {
        setError("Kunde inte nå servern, försök igen");
        setStatus("form");
      }
    }

    return (
        <section className="py-8">
          <h1 className="mb-8 text-3xl font-semibold md:text-4xl">Avboka</h1>
    
          <div className="mx-auto max-w-md rounded-3xl border border-[#806b36] bg-[#282828] p-8">
            {status === "done" ? (
              <div className="flex flex-col gap-6 py-6">
                <p className="text-xl">Nu är din tid avbokad.</p>
                <p className="text-lg">
                  Välkommen att kika på vårt övriga utbud av aktuella filmer!
                </p>
                <Link
                  to="/"
                  className="rounded-md border border-[#e5ca7a] py-2 text-center hover:bg-[#e5ca7a]/10"
                >
                  Gå till startsidan
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-6 py-6">
                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className="text-sm">Email</label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="example@filmvisarna.com"
                    className="rounded-md border border-[#806b36] bg-[#1d1d1d] px-3 py-2 text-sm outline-none placeholder:text-gray-500 focus:border-[#e5ca7a]"
                  />
                </div>
    
                <div className="flex flex-col gap-2">
                  <label htmlFor="bookingNumber" className="text-sm">Bokningsnummer</label>
                  <input
                    id="bookingNumber"
                    type="text"
                    required
                    value={bookingNumber}
                    onChange={(e) => setBookingNumber(e.target.value)}
                    placeholder="B-9FA1C7D..."
                    className="rounded-md border border-[#806b36] bg-[#1d1d1d] px-3 py-2 text-sm uppercase outline-none placeholder:text-gray-500 focus:border-[#e5ca7a]"
                  />
                </div>
    
                {error && (
                  <p role="alert" className="text-sm text-red-400">{error}</p>
                )}
    
                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="mx-auto rounded-md bg-[#e5ca7a] px-8 py-2 font-semibold text-[#1d1d1d] hover:brightness-110 disabled:opacity-50"
                >
                  {status === "loading" ? "Avbokar..." : "Avboka"}
                </button>
              </form>
            )}
          </div>
        </section>
      );
    }