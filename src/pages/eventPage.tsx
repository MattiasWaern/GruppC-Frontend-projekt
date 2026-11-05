
import { useEffect, useState } from "react";
import type { Event } from "../types/event";

export default function EventPage() {
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const controller = new AbortController();

        async function fetchEvents() {
            try {
                const response = await fetch("/api/events", {
                    signal: controller.signal
                });

                if (!response.ok) {
                    throw new Error("Kunde inte hämta events");
                }

                const data: Event[] = await response.json();

                setEvents(data);

            } catch (err) {
                if (
                    err instanceof Error &&
                    err.name === "AbortError"
                ) {
                    return;
                }

                setError("Det gick inte att ladda eventen.");

            } finally {
                setLoading(false);
            }
        }

        fetchEvents();

        return () => controller.abort();
    }, []);

    // Formaterar datum från databasen
    function formatDate(date: string) {
        const datePart = date.split("T")[0].split(" ")[0];
        const [year, month, day] = datePart.split("-");

        return `${year}-${month}-${day}`;
    }

    return (
        <main className="min-h-screen px-4 py-8 text-white sm:px-8">

            <div className="mx-auto max-w-5xl">

                {/* Sidans rubrik */}
                <header className="mb-8 text-center">

                    <h1 className="font-serif text-4xl text-[#d7bd72] sm:text-5xl">
                        Kommande Event
                    </h1>

                    <p className="font-serif text-sm text-[#e4e0d7]">
                        Särskilda kvällar, maratonvisningar och teman
                    </p>

                </header>

                {/* Laddning */}
                {loading && (
                    <p className="text-center text-[#d7bd72]">
                        Laddar events...
                    </p>
                )}

                {/* Felmeddelande */}
                {error && (
                    <p className="text-center text-red-400">
                        {error}
                    </p>
                )}

                {/* Eventlista */}
                {!loading && !error && (
                    <section className="space-y-6">

                        {events.map((event) => (

                            <article
                                key={event.eventId}
                                className="grid grid-cols-1 items-center gap-5 rounded-[18px] border border-[#76663d] bg-[#1b1b1b] p-4 transition duration-300 hover:border-[#d7bd72] sm:grid-cols-2 sm:gap-6"
                            >

                                {/* Eventbild */}
                                <div className="flex min-h-[190px] items-center justify-center overflow-hidden rounded-lg bg-[#151515]">

                                    {event.poster ? (

                                        <img
                                            src={event.poster}
                                            alt={event.title}
                                            className="h-full max-h-[230px] min-h-[190px] w-full object-cover"
                                        />

                                    ) : (

                                        <span className="font-serif text-7xl text-white">
                                            ?
                                        </span>

                                    )}

                                </div>

                                {/* Eventinformation */}
                                <div className="flex flex-col justify-center py-2">

                                    {/* Kategori */}
                                    <span className="mb-2 font-serif text-sm text-[#d7bd72]">
                                        {event.categoryName}
                                    </span>

                                    {/* Datum */}
                                    <div className="mb-3 flex items-center gap-2 text-[#d7bd72]">

                                        {/* Kalenderikon */}
                                        <svg
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="1.5"
                                            className="h-8 w-8"
                                        >
                                            <rect
                                                x="3"
                                                y="5"
                                                width="18"
                                                height="16"
                                                rx="2"
                                            />

                                            <path d="M16 3v4M8 3v4M3 10h18" />

                                        </svg>

                                        <div className="font-serif text-[12px] leading-tight text-[#e4e0d7]">
                                            <p>Datum</p>
                                            <p>{formatDate(event.date)}</p>
                                        </div>

                                    </div>

                                    {/* Eventtitel */}
                                    <h2 className="mb-2 font-serif text-2xl leading-tight">
                                        {event.title}
                                    </h2>

                                    {/* Beskrivning */}
                                    <p className="mb-5 font-serif text-xs text-[#e4e0d7]">
                                        {event.description ||
                                            "Mer information kommer snart."}
                                    </p>

                                    {/* Läs mer knapp */}
                                    <div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                window.location.href =
                                                    `/events/${event.eventId}`;
                                            }}
                                            className="inline-flex items-center gap-2 rounded-full border border-[#76663d] px-4 py-2 font-serif text-xs transition hover:border-[#d7bd72] hover:bg-[#d7bd72] hover:text-black"
                                        >
                                            Ta reda på mer

                                            <span className="text-base">
                                                →
                                            </span>

                                        </button>

                                    </div>

                                </div>

                            </article>

                        ))}

                        {/* Om inga events finns */}
                        {events.length === 0 && (
                            <p className="py-10 text-center text-[#e4e0d7]">
                                Det finns inga kommande event just nu.
                            </p>
                        )}

                    </section>
                )}

            </div>

        </main>
    );
}
