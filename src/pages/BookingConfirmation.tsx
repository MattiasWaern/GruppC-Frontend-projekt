import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

interface Booking {
  bookingId: number;
  viewingId: number;
  booking_number: string;
  booking_confirmation: string;
}

interface Viewing {
  viewingId: number;
  viewing_date: string;
  viewing_start_time: string;
  movieId: number | null;
}

interface Ticket {
  seatId: number;
  row: number;
  seatnumber: number;
  ticketType: string;
  price: number;
}

interface BookingTickets {
  tickets: Ticket[];
  totalPrice: number;
}

export default function BookingConfirmation() {
  const { id } = useParams<{ id: string }>();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [ticketData, setTicketData] = useState<BookingTickets | null>(null);
  const [error, setError] = useState("");
  const [viewing, setViewing] = useState<Viewing | null>(null);
  const [movieTitle, setMovieTitle] = useState("");

  useEffect(() => {
    if (!id) return;

    async function loadBooking() {
      try {
        const [bookingResponse, ticketsResponse] = await Promise.all([
          fetch(`/api/bookings/${id}`),
          fetch(`/api/bookings/${id}/tickets`),
        ]);

        if (!bookingResponse.ok || !ticketsResponse.ok) {
          throw new Error("Kunde inte hämta bokningen.");
        }

        const bookingData: Booking = await bookingResponse.json();
        const tickets: BookingTickets = await ticketsResponse.json();

const viewingResponse = await fetch(
  `/api/viewings/${bookingData.viewingId}`
);

if (!viewingResponse.ok) {
  throw new Error("Kunde inte hämta visningen.");
}

const viewingData: Viewing = await viewingResponse.json();

setBooking(bookingData);
setTicketData(tickets);
setViewing(viewingData);

if (viewingData.movieId) {
  const movieResponse = await fetch(
    `/api/movies/${viewingData.movieId}`
  );

  if (movieResponse.ok) {
    const movie = await movieResponse.json();
    setMovieTitle(movie.title);
  }
}
      } catch {
        setError("Bokningen kunde inte hämtas. Försök igen.");
      }
    }

    loadBooking();
  }, [id]);

  if (error) return <p className="p-8 text-white">{error}</p>;

  if (!booking || !ticketData) {
    return <p className="p-8 text-white">Hämtar bokningen...</p>;
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-12 text-white">
      <div className="rounded-2xl border border-[#e5ca7a]/30 bg-[#282828] p-8">
        <h1 className="mb-3 text-3xl font-bold text-[#e5ca7a]">
          Tack för din bokning!
        </h1>

        <p className="mb-8 text-gray-300">
          Din bokning är registrerad. Spara ditt bokningsnummer.
        </p>

        {viewing && (
    <section className="mb-8 space-y-2">
            <h2 className="text-xl font-semibold">
                {movieTitle || "Film"}
            </h2>

          <p>
            Datum:{" "}
              {new Date(viewing.viewing_date).toLocaleDateString("sv-SE")}
          </p>

          <p>
            Tid: {String(viewing.viewing_start_time).slice(0, 5)}
          </p>
    </section>
    )}

        <div className="mb-8 rounded-xl bg-[#1d1d1d] p-5">
          <p className="mb-2 text-sm text-gray-400">Bokningsnummer</p>
          <p className="break-all text-xl font-bold text-[#e5ca7a]">
            {booking.booking_number}
          </p>
        </div>

        <h2 className="mb-4 text-xl font-semibold">Dina biljetter</h2>

        <ul className="mb-6 space-y-3">
          {ticketData.tickets.map((ticket) => (
            <li
              key={ticket.seatId}
              className="flex justify-between rounded-lg bg-[#1d1d1d] p-4"
            >
              <span>
                Rad {ticket.row}, plats {ticket.seatnumber}
                <span className="block text-sm text-gray-400">
                  {ticket.ticketType}
                </span>
              </span>
              <span>{ticket.price} kr</span>
            </li>
          ))}
        </ul>

        <p className="mb-8 text-right text-lg font-bold">
          Totalt: {ticketData.totalPrice} kr
        </p>

        <Link
          to="/"
          className="inline-block rounded-lg bg-[#e5ca7a] px-6 py-3 font-semibold text-black"
        >
          Till startsidan
        </Link>
      </div>
    </main>
  );
}
