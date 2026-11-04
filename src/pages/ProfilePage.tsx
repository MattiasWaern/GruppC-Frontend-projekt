import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

type Booking = {
  bookingId: number;
  bookingNumber: string;
  status: string;
  bookingDate: string;
  viewingId: number;
  viewingDate: string;
  viewingTime: string;
  movieTitle: string;
  theaterName: string;
  ticketCount: number;
  totalPrice: number;
  seatLabels: string[];
};

type BookingTab = "upcoming" | "history";

const currency = new Intl.NumberFormat("sv-SE", {
  style: "currency",
  currency: "SEK",
  maximumFractionDigits: 0,
});

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("sv-SE", {
    timeZone: "Europe/Stockholm",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}  

function formatTime(time: string) {
  return time.slice(0, 5);
}

function getViewingDate(booking: Booking) {
  const date = new Date(booking.viewingDate)
    .toLocaleDateString("sv-SE", {
      timeZone: "Europe/Stockholm",
    });

  const time = booking.viewingTime.slice(0, 8);

  return new Date(`${date}T${time}`);
}

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [activeTab, setActiveTab] = useState<BookingTab>("upcoming");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchBookings() {
      try {
        setLoading(true);
        setError("");

        const token = localStorage.getItem("token");

        const response = await fetch("/api/bookings/mine", {
          headers: {
            Authorization: `Bearer ${token ?? ""}`,
          },
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Kunde inte hämta bokningarna.");
        }

        if (!Array.isArray(data)) {
          throw new Error("Ogiltigt svar från servern.");
        }

        setBookings(data);
      } catch (err) {
        if (controller.signal.aborted) return;

        setError(err instanceof Error ? err.message : "Något gick fel.");
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchBookings();

    return () => controller.abort();
  }, [user]);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const now = new Date();

  const upcomingBookings = bookings
    .filter((booking) => getViewingDate(booking).getTime() >= now.getTime())
    .sort((a, b) => getViewingDate(a).getTime() - getViewingDate(b).getTime());

  const previousBookings = bookings
    .filter((booking) => getViewingDate(booking).getTime() < now.getTime())
    .sort((a, b) => getViewingDate(b).getTime() - getViewingDate(a).getTime());

  const visibleBookings =
    activeTab === "upcoming" ? upcomingBookings : previousBookings;

  return (
    <main className="min-h-screen bg-[#121212] px-2 py-12 text-[#e4ce83] sm:px-4">
      <div className="mx-auto max-w-4xl">
        {/* Sidhuvud */}
        <div className="mb-10 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#c9a75b]">
            Filmvisarna
          </p>

          <h1 className="font-serif text-4xl text-[#f1e3be]">Min profil</h1>

          <p className="mt-3 text-sm text-[#aaa59b]">
            Dina uppgifter och bokningar på ett ställe.
          </p>
        </div>

        {/* Användaruppgifter */}
        <section className="mb-8 overflow-hidden rounded-2xl border border-[#6c5a31]/50 bg-[#1b1b1b]">
          <div className="flex items-center gap-5 border-b border-[#6c5a31]/40 p-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#b99b4c] bg-[#292929] font-serif text-3xl">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div className="min-w-0">
              <h2 className="break-words font-serif text-2xl text-[#f1e3be]">
                {user.name}
              </h2>

              <p className="text-sm text-[#aaa59b]">Medlem hos Filmvisarna</p>
            </div>
          </div>

          <div className="grid gap-6 p-6 sm:grid-cols-2">
            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-[#aaa59b]">
                Namn
              </p>

              <p className="text-[#f1e3be]">{user.name}</p>
            </div>

            <div>
              <p className="mb-2 text-xs uppercase tracking-wider text-[#aaa59b]">
                E-postadress
              </p>

              <p className="break-all text-[#f1e3be]">{user.email}</p>
            </div>
          </div>
        </section>

        {/* Bokningshistorik */}
        <section className="overflow-hidden rounded-2xl border border-[#6c5a31]/50 bg-[#1b1b1b]">
          <div className="border-b border-[#6c5a31]/40 p-6">
            <h2 className="font-serif text-2xl text-[#f1e3be]">
              Mina bokningar
            </h2>

            <p className="mt-2 text-sm text-[#aaa59b]">
              Se dina kommande och tidigare biobesök.
            </p>
          </div>

          {/* Flikar */}
          <div className="flex border-b border-[#6c5a31]/40">
            <button
              type="button"
              onClick={() => setActiveTab("upcoming")}
              className={`flex-1 cursor-pointer px-4 py-4 text-sm transition ${
                activeTab === "upcoming"
                  ? "border-b-2 border-[#d7b83e] bg-[#252525] text-[#f1e3be]"
                  : "text-[#aaa59b] hover:text-[#f1e3be]"
              }`}
            >
              Kommande ({upcomingBookings.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("history")}
              className={`flex-1 cursor-pointer px-4 py-4 text-sm transition ${
                activeTab === "history"
                  ? "border-b-2 border-[#d7b83e] bg-[#252525] text-[#f1e3be]"
                  : "text-[#aaa59b] hover:text-[#f1e3be]"
              }`}
            >
              Historik ({previousBookings.length})
            </button>
          </div>

          <div className="space-y-4 p-4 sm:p-6">
            {loading && (
              <p className="py-10 text-center text-sm text-[#aaa59b]">
                Hämtar dina bokningar...
              </p>
            )}

            {!loading && error && (
              <div
                role="alert"
                className="rounded-xl border border-red-900/60 bg-red-950/20 p-5 text-sm text-red-300"
              >
                {error}
              </div>
            )}

            {!loading && !error && visibleBookings.length === 0 && (
              <div className="py-12 text-center">
                <h3 className="mb-3 font-serif text-xl text-[#f1e3be]">
                  {activeTab === "upcoming"
                    ? "Inga kommande bokningar"
                    : "Ingen bokningshistorik"}
                </h3>

                <p className="mb-6 text-sm text-[#aaa59b]">
                  {activeTab === "upcoming"
                    ? "Du har inga kommande biobesök inbokade."
                    : "Här visas dina tidigare biobesök."}
                </p>

                <Link
                  to="/movies"
                  className="inline-block rounded-lg bg-[#d7b83e] px-5 py-3 text-sm font-semibold text-[#181818] transition hover:bg-[#ebd05c]"
                >
                  Utforska filmer
                </Link>
              </div>
            )}

            {!loading &&
              !error &&
              visibleBookings.map((booking) => (
                <article
                  key={booking.bookingId}
                  className="overflow-hidden rounded-xl border border-[#6c5a31]/40 bg-[#242424]"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#6c5a31]/30 p-4 sm:p-5">
                    <div>
                      <p className="mb-1 text-xs uppercase tracking-wider text-[#aaa59b]">
                        Bokningsnummer
                      </p>

                      <p className="font-mono text-sm font-semibold tracking-wider text-[#e5ca7a]">
                        {booking.bookingNumber}
                      </p>
                    </div>

                    <span className="rounded-full border border-[#806b36] px-3 py-1 text-xs text-[#e5ca7a]">
                      {booking.status === "confirmed"
                        ? "Bekräftad"
                        : booking.status}
                    </span>
                  </div>

                  <div className="p-4 sm:p-5">
                    <h3 className="mb-5 font-serif text-2xl text-[#f1e3be]">
                      {booking.movieTitle}
                    </h3>

                    <div className="grid gap-5 text-sm sm:grid-cols-2">
                      <div>
                        <p className="mb-1 text-xs text-[#aaa59b]">Datum</p>
                        <p>{formatDate(booking.viewingDate)}</p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-[#aaa59b]">Tid</p>
                        <p>{formatTime(booking.viewingTime)}</p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-[#aaa59b]">Salong</p>
                        <p>{booking.theaterName}</p>
                      </div>

                      <div>
                        <p className="mb-1 text-xs text-[#aaa59b]">Biljetter</p>
                        <p>{booking.ticketCount} st</p>
                      </div>

                      <div className="sm:col-span-2">
                        <p className="mb-1 text-xs text-[#aaa59b]">Platser</p>

                        <p>
                          {booking.seatLabels.length > 0
                            ? booking.seatLabels.join(", ")
                            : "Inga platser registrerade"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#6c5a31]/40 pt-5">
                      <div>
                        <p className="mb-1 text-xs text-[#aaa59b]">Totalpris</p>

                        <p className="text-xl font-semibold text-[#f1e3be]">
                          {currency.format(booking.totalPrice)}
                        </p>
                      </div>
                      <div className="flex flex-wrap items-center gap-3">
                        <Link
                          to={`/booking-confirmation/${booking.bookingId}`}
                          className="rounded-lg border border-[#b99b4c] px-4 py-2.5 text-sm text-[#e5ca7a] transition hover:bg-[#b99b4c] hover:text-black"
                        >
                          Visa bokning
                        </Link>

                        {activeTab === "upcoming" && (
                          <Link
                            to="/cancel-booking"
                            state={{
                              email: user.email,
                              bookingNumber: booking.bookingNumber,
                            }}
                            className="rounded-lg border border-red-800 px-4 py-2.5 text-sm text-red-300 transition hover:bg-red-900/30"
                          >
                            Avboka
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
          </div>
        </section>

        {/* Logga ut */}
        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="cursor-pointer rounded-lg border border-red-900/70 px-6 py-3 text-sm text-red-300 transition hover:bg-red-950/50"
          >
            Logga ut
          </button>
        </div>
      </div>
    </main>
  );
}
