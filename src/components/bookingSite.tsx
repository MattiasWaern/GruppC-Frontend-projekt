import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';

type TicketCounts = {
    adult: number;
    child: number;
    senior: number;
};

type Seat = {
    id: number;
    rowNumber: number;
    seatNumber: number;
    isBooked: boolean;
};

type ApiSeat = {
    seatId?: number;
    id?: number;
    row?: number;
    rowNumber?: number;
    seatnumber?: number;
    seatNumber?: number;
    isBooked: number | boolean;
};

type ViewingMovie = {
    title: string;
    posterUrl: string | null;
};

const prices: Record<keyof TicketCounts, number> = {
    adult: 140,
    child: 80,
    senior: 120,
};

const sek = new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
});

function toSeat(raw: ApiSeat): Seat {
    return {
        id: Number(raw.seatId ?? raw.id),
        rowNumber: Number(raw.row ?? raw.rowNumber),
        seatNumber: Number(raw.seatnumber ?? raw.seatNumber),
        isBooked: Boolean(raw.isBooked),
    };
}

// ikonerna för sittplatserna, rygg och sits + lagt till checkmark om platsen är vald
const SeatIcon: React.FC<{ className?: string; isSelected?: boolean }> = ({
    className = '',
    isSelected = false,
}) => (
    <svg
        viewBox="0 0 40 40"
        className={`h-8 w-7 shrink-0 ${className}`}
        fill="currentColor"
        aria-hidden="true"
    >
        <rect
            x="10"
            y="3"
            width="20"
            height="11"
            rx="2"
        />

        <rect
            x="6"
            y="13"
            width="28"
            height="23"
            rx="3"
        />

        {isSelected && (
            <path
                d="M13 23 L18 28 L27 19"
                fill="none"
                stroke="#111111"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        )}
    </svg>
);

const BookingPage: React.FC<{ userId: number }> = ({ userId }) => {
    const navigate = useNavigate();
    const { viewingId: viewingIdParam } = useParams<{
        viewingId: string;
    }>();

    const viewingId = Number(viewingIdParam);

    const validViewingId =
        viewingIdParam !== undefined &&
        /^\d+$/.test(viewingIdParam) &&
        Number.isSafeInteger(viewingId) &&
        viewingId > 0;

    const [seats, setSeats] = useState<Seat[]>([]);
    const [movie, setMovie] = useState<ViewingMovie | null>(null);
    const [ticketCounts, setTicketCounts] = useState<TicketCounts>({
        adult: 0,
        child: 0,
        senior: 0,
    });
    const [selectedSeatIds, setSelectedSeatIds] = useState<number[]>([]);
    const [loadingSeats, setLoadingSeats] = useState(true);
    const [loadingMovie, setLoadingMovie] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
    window.scrollTo(0, 0);
}, []);

    useEffect(() => {
        if (!validViewingId) {
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        async function loadMovie() {
            try {
                const viewingRes = await fetch(
                    `/api/viewings/${viewingId}`,
                    { signal }
                );

                if (!viewingRes.ok) {
                    throw new Error('Kunde inte hämta visningen.');
                }

                const viewing: { movieId: number } =
                    await viewingRes.json();

                const movieRes = await fetch(
                    `/api/movies/${viewing.movieId}`,
                    { signal }
                );

                if (!movieRes.ok) {
                    throw new Error(
                        'Kunde inte hämta filmens information.'
                    );
                }

                const data = await movieRes.json();

                setMovie({
                    title: data.title ?? data.name ?? '',
                    posterUrl: data.posterUrl ?? data.poster ?? null,
                });
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                if (!signal.aborted) {
                    setLoadingMovie(false);
                }
            }
        }

        loadMovie();

        return () => controller.abort();
    }, [viewingId, validViewingId]);

    useEffect(() => {
        if (!validViewingId) {
            return;
        }

        const controller = new AbortController();
        const { signal } = controller;

        async function loadSeats() {
            try {
                const res = await fetch(
                    `/api/viewings/${viewingId}/seats`,
                    { signal }
                );

                if (!res.ok) {
                    throw new Error('Kunde inte hämta sittplatserna.');
                }

                const data: unknown = await res.json();

                if (!Array.isArray(data)) {
                    throw new Error(
                        'Felaktigt format på sittplatserna.'
                    );
                }

                const loaded = (data as ApiSeat[]).map(toSeat);
                setSeats(loaded);

                setSelectedSeatIds((current) =>
                    current.filter((id) =>
                        loaded.some(
                            (seat) => seat.id === id && !seat.isBooked
                        )
                    )
                );
            } catch (err: unknown) {
                if (err instanceof Error && err.name !== 'AbortError') {
                    setError(err.message);
                }
            } finally {
                if (!signal.aborted) {
                    setLoadingSeats(false);
                }
            }
        }

        loadSeats();

        return () => controller.abort();
    }, [viewingId, validViewingId]);

    const totalTickets =
        ticketCounts.adult +
        ticketCounts.child +
        ticketCounts.senior;

    const totalPrice =
        ticketCounts.adult * prices.adult +
        ticketCounts.child * prices.child +
        ticketCounts.senior * prices.senior;

    const canContinue =
        validViewingId &&
        !loadingSeats &&
        !loadingMovie &&
        totalTickets > 0 &&
        selectedSeatIds.length === totalTickets;

    const handleTicketChange = (
        type: keyof TicketCounts,
        delta: number
    ) => {
        const newValue = ticketCounts[type] + delta;

        if (newValue < 0) {
            return;
        }

        const next = {
            ...ticketCounts,
            [type]: newValue,
        };

        const nextTotal =
            next.adult + next.child + next.senior;

        setTicketCounts(next);
        setSelectedSeatIds((current) => current.slice(0, nextTotal));
    };

    const handleSeatClick = (seat: Seat) => {
        if (seat.isBooked || totalTickets === 0) {
            return;
        }

        setSelectedSeatIds((current) => {
            if (current.includes(seat.id)) {
                return current.filter((id) => id !== seat.id);
            }

            if (current.length >= totalTickets) {
                return current;
            }

            return [...current, seat.id];
        });
    };

    const handleBooking = async () => {
    setError('');

    const ticketTypeIds = {
        adult: 3,
        child: 1,
        senior: 2,
    };

    const tickets = selectedSeatIds.map((seatId, index) => {
        const ticketTypes = [
            ...Array(ticketCounts.adult).fill(ticketTypeIds.adult),
            ...Array(ticketCounts.child).fill(ticketTypeIds.child),
            ...Array(ticketCounts.senior).fill(ticketTypeIds.senior),
        ];

        return {
            seatId,
            ticketTypeId: ticketTypes[index],
        };
    });

    try {
        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                userId,
                viewingId,
                tickets,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'Kunde inte skapa bokningen.');
        }

        navigate(`/booking-confirmation/${data.bookingId}`);
    } catch (err) {
        setError(
            err instanceof Error
                ? err.message
                : 'Ett fel uppstod när bokningen skulle skapas.'
        );
    }
};

    const rows = Array.from(
        new Set(seats.map((seat) => seat.rowNumber))
    ).sort((a, b) => a - b);

    if (!validViewingId) {
        return (
            <div className="flex min-h-screen items-center justify-center bg-[#111111] px-4 text-center text-[#e6c96a]">
                <div>
                    <h1 className="mb-3 font-serif text-2xl">
                        Ogiltig visning
                    </h1>
                    <p>
                        Kontrollera webbadressen och försök igen.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#111111] px-4 py-8 text-[#e6c96a] sm:px-8 lg:px-12">
            <div className="mx-auto w-full max-w-5xl">
                <div className="mb-10 grid grid-cols-1 items-start gap-8 sm:grid-cols-[1fr_180px] lg:grid-cols-[1fr_220px]">
                    <section className="w-full max-w-md">
                        <h1 className="mb-3 font-serif text-xl font-normal tracking-wide text-[#d9bd62]">
                            Välj antal biljetter
                        </h1>

                        <div className="rounded-xl bg-[#1b1b1b] px-4 py-2 text-white sm:px-5">
                            {(
                                [
                                    ['adult', 'Vuxen'],
                                    ['child', 'Barn'],
                                    ['senior', 'Pensionär'],
                                ] as [keyof TicketCounts, string][]
                            ).map(([type, label]) => (
                                <div
                                    key={type}
                                    className="flex min-h-11 items-center justify-between gap-3 font-serif text-base sm:text-lg"
                                >
                                    <span className="min-w-0 flex-1">
                                        {label}
                                    </span>

                                    <span className="w-14 text-right tabular-nums">
                                        {prices[type]} kr
                                    </span>

                                    
                                        <button
                                            type="button"
                                            onClick={() => handleTicketChange(type, -1)}
                                            disabled={ticketCounts[type] === 0}
                                            aria-label={`Ta bort ${label.toLowerCase()}`}
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white hover:text-[#e0bd38] disabled:opacity-40"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                            >
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M7 12h10" />
                                            </svg>
                                        </button>

                                        <span className="w-4 text-center text-sm tabular-nums">
                                            {ticketCounts[type]}
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => handleTicketChange(type, 1)}
                                            aria-label={`Lägg till ${label.toLowerCase()}`}
                                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white hover:text-[#e0bd38]"
                                        >
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="h-5 w-5"
                                                fill="none"
                                                stroke="currentColor"
                                                strokeWidth="1.8"
                                            >
                                                <circle cx="12" cy="12" r="9" />
                                                <path d="M12 7v10M7 12h10" />
                                            </svg>
                                        </button>

                                </div>
                            ))}
                        </div>

                        <p className="mt-3 font-serif text-sm text-[#d9bd62]">
                            Totalt: {sek.format(totalPrice)}
                        </p>
                    </section>

                    <div className="justify-self-center">
                        {loadingMovie ? (
                            <div className="flex aspect-2/3 w-36 items-center justify-center rounded-lg bg-[#1b1b1b] text-sm text-zinc-400 lg:w-40">
                                Laddar film...
                            </div>
                        ) : movie?.posterUrl ? (
                            <img
                                src={movie.posterUrl}
                                alt={`Filmplansch för ${movie.title}`}
                                className="aspect-2/3 w-36 rounded-lg border border-[#9f8847] object-cover lg:w-40"
                            />
                        ) : (
                            <div className="flex aspect-2/3 w-36 items-center justify-center rounded-lg border border-[#9f8847] bg-[#1b1b1b] p-3 text-center font-serif text-sm text-[#d9bd62] lg:w-40">
                                Ingen plansch tillgänglig
                            </div>
                        )}

                        {movie && (
                            <h2 className="mt-2 max-w-40 text-center font-serif text-sm text-[#d9bd62]">
                                {movie.title}
                            </h2>
                        )}
                    </div>
                </div>

                <section>
                    <h2 className="mb-2 text-center font-serif text-2xl font-normal text-[#d9bd62] sm:text-3xl">
                        Välj platser
                    </h2>

                    <div className="bg-[#1b1b1b] px-3 pb-5 pt-3 sm:px-6 sm:pb-6">
                        <div className="mb-6 flex w-fit mx-auto items-center gap-3">
                            <div className="flex w-24 flex-col items-center gap-1 text-white">
                                <span className="font-serif text-sm sm:text-lg">
                                    Upptagen
                                </span>
                                <SeatIcon className="text-[#D46A70]" />
                            </div>

                            <div className="flex w-24 flex-col items-center gap-1 text-white">
                                <span className="font-serif text-sm sm:text-lg">
                                    Ledig
                                </span>
                                <SeatIcon className="text-[#A8C982]" />
                            </div>

                            <div className="flex w-24 flex-col items-center gap-1 text-white">
                                <span className="font-serif text-sm sm:text-lg">
                                    Vald
                                </span>
                                <SeatIcon className="text-[#E5C86A]" isSelected={true} />
                            </div>
                        </div>

                        <div className="mx-auto mb-6 flex h-7 w-[88%] items-center justify-center bg-[#dfbd35] font-serif text-base text-black sm:text-lg">
                            Bioduken
                        </div>

                        {loadingSeats ? (
                            <p className="py-10 text-center font-serif text-[#d9bd62]">
                                Laddar platser...
                            </p>
                        ) : seats.length === 0 ? (
                            <p className="py-10 text-center font-serif text-zinc-400">
                                Inga platser hittades.
                            </p>
                        ) : (
                            <div className="space-y-2 sm:space-y-3">
                                {rows.map((rowNumber) => {
                                    const rowSeats = seats
                                        .filter(
                                            (seat) =>
                                                seat.rowNumber === rowNumber
                                        )
                                        .sort(
                                            (a, b) =>
                                                a.seatNumber - b.seatNumber
                                        );

                                    return (
                                        <div
                                            key={rowNumber}
                                            className="flex items-center justify-center gap-3 sm:gap-4"
                                        >
                                            <span className="shrink-0 font-serif text-xl text-[#e6c96a] sm:text-2xl">
                                                {rowNumber}
                                            </span>

                                            <div className="flex items-center gap-0 sm:gap-0.5">
                                                {rowSeats.map((seat) => {
                                                    const isSelected =
                                                        selectedSeatIds.includes(
                                                            seat.id
                                                        );

                                                    const seatColor =
                                                        seat.isBooked
                                                            ? 'text-[#D46A70]'
                                                            : isSelected
                                                              ? 'text-[#E5C86A]'
                                                              : 'text-[#A8C982]';

                                                    return (
                                                        <button
                                                            key={seat.id}
                                                            type="button"
                                                            disabled={seat.isBooked}
                                                            onClick={() =>
                                                                handleSeatClick(
                                                                    seat
                                                                )
                                                            }
                                                            aria-label={`Rad ${seat.rowNumber}, plats ${seat.seatNumber}${seat.isBooked ? ', upptagen' : isSelected ? ', vald' : ', ledig'}`}
                                                            aria-pressed={isSelected}
                                                            className={`flex items-center justify-center rounded-md transition hover:brightness-125 focus-visible:outline focus-visible:outline-[#e5c86a] disabled:cursor-not-allowed ${seatColor}`}
                                                        >
                                                            <SeatIcon isSelected={isSelected} />
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        <div className="mt-7 flex justify-center">
                            <div
                                aria-live="polite"
                                className="rounded-xl border border-[#e5c86a] px-4 py-2 font-serif text-base text-white sm:text-lg"
                            >
                                {selectedSeatIds.length > 0
                                    ? selectedSeatIds
                                          .map((id) => {
                                              const seat = seats.find(
                                                  (item) => item.id === id
                                              );

                                              return seat
                                                  ? `Rad ${seat.rowNumber}, Plats ${seat.seatNumber}`
                                                  : '';
                                          })
                                          .filter(Boolean)
                                          .join(' · ')
                                    : 'Välj dina platser'}
                            </div>
                        </div>

                        <div className="mt-3 text-center font-serif text-sm text-[#d9bd62]">
                            Valda platser: {selectedSeatIds.length} av{' '}
                            {totalTickets}
                        </div>
                    </div>
                </section>

                {error && (
                    <p
                        role="alert"
                        className="mt-4 rounded-lg border border-red-800 bg-red-950/40 p-3 text-sm text-red-300"
                    >
                        {error}
                    </p>
                )}

                <div className="mt-5 flex justify-end">
                    <button
                         type="button"
                         disabled={!canContinue}
                         onClick={handleBooking}
                        className="w-full rounded-md bg-[#dfbd35] px-7 py-3 font-serif text-base text-black transition hover:bg-[#edd05b] disabled:cursor-not-allowed disabled:opacity-40 sm:w-auto"
                        >
                         Bekräfta bokning
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingPage;