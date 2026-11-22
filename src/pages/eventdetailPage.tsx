
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Event } from "../types/event";

type Viewing = {
  viewingId: number;
  eventId: number | null;
  viewing_date: string;
  viewing_start_time: string;
};

function formatEventDate(date: string) {
  const eventDate = new Date(date.replace(" ", "T"));

  if (Number.isNaN(eventDate.getTime())) {
    return "Okänt datum";
  }

  return eventDate.toLocaleDateString("sv-SE", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatEventTime(date: string) {
  const eventDate = new Date(date.replace(" ", "T"));

  if (Number.isNaN(eventDate.getTime())) {
    return "";
  }

  return eventDate.toLocaleTimeString("sv-SE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function EventDetailPage() {
  const { id } = useParams();

  const [event, setEvent] = useState<Event | null>(null);
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewingError, setViewingError] = useState("");
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchEvent() {
      try {
        setLoading(true);
        setError("");
        setViewingError("");

        // Hämta evenemanget
        const response = await fetch(`/api/events/${id}`, {
          signal: controller.signal,
        });

        if (response.status === 404) {
          throw new Error("Evenemanget kunde inte hittas.");
        }

        if (!response.ok) {
          throw new Error(
            `Kunde inte hämta evenemang (${response.status}).`
          );
        }

        const data: Event = await response.json();

        if (!data || !data.eventId) {
          throw new Error("Ogiltigt svar från servern.");
        }

        setEvent(data);

        // Hämta alla visningar
        const viewingResponse = await fetch("/api/viewings", {
          signal: controller.signal,
        });

        if (!viewingResponse.ok) {
          throw new Error("Kunde inte hämta evenemangets visningar.");
        }

        const viewingData: Viewing[] = await viewingResponse.json();

        // Filtrera fram visningar som tillhör detta evenemang
        const eventViewings = viewingData.filter(
          (viewing) => Number(viewing.eventId) === Number(data.eventId)
        );

        setViewings(eventViewings);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          // Fel vid hämtning av visningar ska inte dölja evenemanget
          if (err.message === "Kunde inte hämta evenemangets visningar.") {
            setViewingError(err.message);
          } else {
            setError(err.message);
          }
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    if (id) {
      fetchEvent();
    }

    return () => controller.abort();
  }, [id]);

  // Loading
  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] p-10 text-center text-[#e4ce83]">
        Laddar evenemang...
      </main>
    );
  }

  // Error
  if (error || !event) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-[#121212] px-4 text-center">
        <h1 className="mb-4 text-3xl font-medium text-[#f1e3be]">
          {error || "Evenemanget kunde inte hittas."}
        </h1>
      </main>
    );
  }

  return (
    <main className="min-h-screen w-full bg-[#121212] px-4 pb-20 pt-12 font-serif text-[#e4ce83] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-6xl">

        {/* Evenemangets innehåll */}
        <div className="overflow-hidden rounded-xl border border-[#6c5a31]/50 bg-[#1b1b1b]">

         {/* Poster */}
       <div className="relative bg-[#252525] px-6 pt-6 pb-6">
        <div className="overflow-hidden rounded-xl">
          {event.poster ? (
          <img
        src={event.poster}
        alt={`Bild för ${event.title}`}
        className="mx-auto block max-h-[550px] w-full rounded-xl object-cover"
      />
    ) : (
      <div className="flex min-h-80 items-center justify-center rounded-3xl bg-[#1b1b1b] text-[#c9a75b]">
        Ingen evenemangsbild tillgänglig
      </div>
    )}
  </div>

  
</div>

          {/* Information */}
          <div className="p-6 sm:p-10 lg:p-12">

            {/* Titel */}
            <header className="mb-8 border-b border-[#6c5a31]/50 pb-8">
              <h1 className="mb-4 text-4xl font-medium tracking-wide text-[#f1e3be] sm:text-5xl">
                {event.title}
              </h1>

              <p className="font-sans text-lg text-[#b9a980]">
                {event.categoryName}
              </p>
            </header>

            {/* Datum och tid */}
            <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-2">

              <div className="rounded-xl border border-[#6c5a31]/50 bg-[#222222] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xl text-[#d7b83e]">
                    ◷
                  </span>

                  <h2 className="font-sans text-sm font-medium text-[#aaa59b]">
                    Datum
                  </h2>
                </div>

                <p className="text-lg capitalize text-[#f1e3be]">
                  {formatEventDate(event.date)}
                </p>
              </div>

              <div className="rounded-xl border border-[#6c5a31]/50 bg-[#222222] p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-xl text-[#d7b83e]">
                    ◷
                  </span>

                  <h2 className="font-sans text-sm font-medium text-[#aaa59b]">
                    Starttid
                  </h2>
                </div>

                <p className="text-lg text-[#f1e3be]">
                  {formatEventTime(event.date)}
                </p>
              </div>
            </div>

            {/* Beskrivning */}
            <section>
              <h2 className="mb-5 border-b border-[#6c5a31]/50 pb-3 text-2xl font-medium text-[#f1e3be]">
                Om evenemanget
              </h2>

                {event.extraInfo && (
                <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    aria-expanded={showMore}
                    className="w-full cursor-pointer rounded-[18px] border border-[#76663d] bg-[#1b1b1b] p-5 text-left transition duration-300 hover:border-[#d7bd72]"
                >
                    
                    <div className="mx-auto max-w-2xl font-sans text-base leading-6 text-[#c4b99e]">
                    {(showMore
                        ? event.extraInfo.split("\n")
                        : event.extraInfo.split("\n").slice(0, 4)
                    ).map((line, index, lines) => {
                        if (line.trim() === "[left]") {
                        return null;
                        }

                        const leftAligned = lines
                        .slice(0, index)
                        .some((previousLine) => previousLine.trim() === "[left]");

                        const alignment = leftAligned ? "text-left" : "text-center";

                        if (line.startsWith("### ")) {
                        return (
                            <h4
                            key={index}
                            className={`mb-1 mt-2 font-serif text-lg text-[#d7bd72] ${alignment}`}
                            >
                            {line.slice(4)}
                            </h4>
                        );
                        }

                        if (line.startsWith("## ")) {
                        return (
                            <h3
                            key={index}
                            className={`mb-1 mt-3 font-serif text-xl text-[#d7bd72] ${alignment}`}
                            >
                            {line.slice(3)}
                            </h3>
                        );
                        }

                        if (line.startsWith("# ")) {
                        return (
                            <h2
                            key={index}
                            className={`mb-2 mt-4 font-serif text-2xl text-[#d7bd72] ${alignment}`}
                            >
                            {line.slice(2)}
                            </h2>
                        );
                        }

                        return (
                        <p key={index} className={`leading-6 ${alignment}`}>
                            {line || "\u00A0"}
                        </p>
                        );
                    })}
                    </div>

                    <div className="mt-4 flex items-center justify-center gap-2 font-serif text-sm text-[#d7bd72]">
                    <span>{showMore ? "Visa mindre" : "Läs mer"}</span>
                    <span>{showMore ? "↑" : "↓"}</span>
                    </div>
                </button>
                )}
            </section>

            {/* Bokningsbara visningar */}
            <section className="mt-12">
              <h2 className="mb-5 border-b border-[#6c5a31]/50 pb-3 text-2xl font-medium text-[#f1e3be]">
                Boka biljetter
              </h2>

              {viewingError ? (
                <p className="font-sans text-[#c4b99e]">
                  {viewingError}
                </p>
              ) : viewings.length === 0 ? (
                <p className="font-sans text-[#c4b99e]">
                  Det finns inga bokningsbara visningar för detta evenemang just nu.
                </p>
              ) : (
                <div className="space-y-4">
                  {viewings.map((viewing) => (
                    <div
                      key={viewing.viewingId}
                      className="flex flex-col items-start justify-between gap-4 rounded-xl border border-[#6c5a31]/50 bg-[#222222] p-5 sm:flex-row sm:items-center"
                    >
                      <div>
                        <p className="text-lg capitalize text-[#f1e3be]">
                          {formatEventDate(viewing.viewing_date)}
                        </p>

                        <p className="mt-1 font-sans text-sm text-[#b9a980]">
                          Starttid: {viewing.viewing_start_time.slice(0, 5)}
                        </p>

                        <p className="mt-1 font-sans text-sm text-[#b9a980]">
                           {event.title} </p>
                      </div>

                      <Link
                        to={`/bookings/${viewing.viewingId}`}
                        className="inline-flex items-center justify-center rounded-lg border border-[#d7b83e] bg-[#d7b83e] px-6 py-3 font-sans text-sm font-medium text-[#121212] transition hover:bg-[#f1e3be]"
                      >
                        Boka biljetter
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>

      </div>
    </main>
  );
}
