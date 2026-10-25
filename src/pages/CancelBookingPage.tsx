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
        // POST /api/bookings/cancel måste finnas i backend
        const res = await fetch("/api/bookings/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            bookingNumber: bookingNumber.trim().toUpperCase(),
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