import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import type { Movie } from "../types/movie";
import type { Viewing } from "../types/viewing";
import type { Theater } from "../types/theater";
import formatTime from "../utils/formatTime";

function toCssBackground(value?: string | null) {
  if (!value) return undefined;

  const background = value.replace(/^background\s*:\s*/i, "").trim();

  if (background.includes("(") || background.startsWith("#")) {
    return background;
  }

  return `#${background}`;
}

export default function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewings, setViewings] = useState<Viewing[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedViewingId, setSelectedViewingId] = useState<number | null>(
    null,
  );
  const [viewingLoading, setViewingLoading] = useState(true);
  const [viewingError, setViewingError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Inget film-ID angavs.");
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchMovie() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(`/api/movies/${id}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Filmen hittades inte."
              : `Kunde inte hämta filmen (${response.status}).`,
          );
        }

        const data: Movie = await response.json();
        setMovie(data);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMovie();

    return () => controller.abort();
  }, [id]);

  useEffect(() => {
    if (!id) {
      setViewingError("Inget film-ID angavs.");
      setViewingLoading(false);
      return;
    }

    const controller = new AbortController();

    async function fetchViewings() {
      try {
        setViewingLoading(true);
        setViewingError("");
        setSelectedDate("");
        setSelectedViewingId(null);

        const [viewingsResponse, theatersResponse] = await Promise.all([
          fetch(`/api/viewings`, { signal: controller.signal }),
          fetch(`/api/theaters`, { signal: controller.signal }),
        ]);

        if (!viewingsResponse.ok || !theatersResponse.ok) {
          throw new Error(
            "Kunde inte hämta visningsinformation eller bioinformation.",
          );
        }

        const viewingsData: Viewing[] = await viewingsResponse.json();
        const theatersData: Theater[] = await theatersResponse.json();
        const movieViewings = viewingsData.filter(
          (viewing) => viewing.movieId === Number(id),
        );

        setViewings(movieViewings);
        setTheaters(theatersData);
      } catch (err) {
        if (err instanceof Error && err.name !== "AbortError") {
          setViewingError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setViewingLoading(false);
        }
      }
    }

    fetchViewings();

    return () => controller.abort();
  }, [id]);
function getDateKey(value: string) {
return value.slice(0, 10);
}
const availableDates = Array.from(new Set(viewings.map((viewing) => getDateKey(viewing.viewing_date.toString())))).sort();
const selectedDateViewings = viewings.filter((viewing) => getDateKey(viewing.viewing_date.toString()) === selectedDate 
);
function getTheaterName(theaterId: number | null) {
return theaters.find((theater) => theater.theaterId === theaterId)?.name || `salong ${theaterId}`;
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("sv-SE", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}   

 if (loading) {
    return (
      <p className="min-h-screen bg-[#121212] p-12 text-center text-[#e4ce83]">
        Laddar film...
      </p>
    );
  }

  if (error || !movie) {
    return (
      <main className="min-h-screen bg-[#121212] p-6 font-serif text-[#e4ce83]">
        <p>{error || "Filmen hittades inte."}</p>
        <Link
          to="/movies"
          className="mt-5 inline-block text-[#e4ce83] underline hover:text-white"
        >
          Tillbaka till filmer
        </Link>
      </main>
    );
  }

  return (
        <main
          className="min-h-screen w-full font-serif text-[#e4ce83]"
          style={{
            background: toCssBackground(movie.background_color) ?? "#121212",
          }}
        >
    <div className="mx-auto min-h-screen w-full max-w-6xl px-5 py-8 sm:px-8 lg:px-12">
        {/* Filmens titel och information */}
        <section className="mb-4.5 text-center">
          <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-medium text-[#e5d27c]">
            {movie.title}
          </h1>

          <p className="my-1 text-xl text-[#e4ce83]">
            {formatTime(movie)} min Från {movie.age_limit} år
          </p>

          {movie.genres?.length > 0 && (
            <p className="my-1.25 text-l text-[#d9bb79]">
              {movie.genres.join(", ")}
            </p>
          )}
        </section>

        {/* film bild med trailerknapp */}
        <section className="relative mx-auto mb-4 aspect-video w-full max-w-[1800px] overflow-hidden rounded-[15px] border-2 border-[#e5232d] bg-[#171717] shadow-lg">
          {movie.poster ? (
            <img
              className="block h-full w-full object-cover"
              src={movie.poster}
              alt={`Affisch för ${movie.title}`}
            />
          ) : (
            <div className="grid h-full w-full place-items-center text-2xl text-[#e4ce83]">
              {movie.title}
            </div>
          )}

          {movie.trailer && (
            <a
              className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/[0.07] font-sans text-sm font-semibold text-white [text-shadow:0_1px_4px_#000] transition-colors duration-200 hover:bg-black/30"
              href={movie.trailer}
              target="_blank"
              rel="noreferrer"
              aria-label={`Se trailer för ${movie.title}`}
            >
              <span className="grid h-11.5 w-11.5 place-items-center rounded-full bg-[#e4ce83] pl-0.75 text-lg text-[#181818] text-shadow-none">
                ▶
              </span>
              <span>Se trailer</span>
            </a>
          )}
        </section>

        {/* Filmbeskrivning */}
        <p className="mx-auto mt-4 max-w-140 whitespace-pre-line text-s leading-[1.55] text-[#e4ce83]">
          {movie.description}
        </p>

        {/* Biljettpanel FÅR KOPPLA DETTA TILL RÄTT DATUM SENARE*/}
        <section
          id="biljetter"
          className="mx-auto mt-14 w-full max-w-120nded-xl border border-[#6c5a31] bg-[#191919] p-4.5 font-sans text-[#e4ce83] sm:mt-13.75 sm:p-6"
        >
          <h2 className="mb-4.5 text-base font-normal">Biljetter</h2>

{viewingLoading && <p className="text-[#e4ce83]">Laddar visningar...</p>}
{viewingError && <p className="text-sm text-red-400">{viewingError}</p>}

{!viewingLoading && !viewingError && availableDates.length == 0 && (
 <p className="text-[#e4ce83]">Inga visningar tillgängliga för denna film.</p>
)}    
<div className="grid grid-cols-4 gap-1.5 sm:gap-2.5">
  {availableDates.map((dateKey) => (
    <button
    type="button"
    key={dateKey}
   
    onClick={() => {
      setSelectedDate(dateKey);  
      setSelectedViewingId(null); // Reset selected viewing when date changes
    }}
    className={`flex min-h-16.25 flex-col items-center justify-center gap-1 rounded-[3px] text-xs sm:min-h-18.75 ${
      selectedDate === dateKey ? "bg-[#d7b83e] text-[#181818]" : "bg-[#2b2b2b] text-[#dedede]"
    }`}
    >
      {formatDate(dateKey)}
    </button>
  ))}
</div>

{selectedDate && (
  <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
    {selectedDateViewings.map((viewing) => (
      <button
        type="button"
        key={viewing.viewingId}
        onClick={() => setSelectedViewingId(viewing.viewingId)}
        className={`flex flex-col items-center rounded-[3px] bg-[#2b2b2b] p-2 text-xs text-[#dedede] ${
          selectedViewingId === viewing.viewingId ? "border border-[#e4ce83]" : ""
        }`}
      >
        <strong className="text-lg text-[#e4ce83]">
          {viewing.viewing_start_time.slice(0, 5)}
        </strong>
        <span>{getTheaterName(viewing.theaterId)}</span>
      </button>
    ))}
  </div>
)}

          <div className="flex flex-wrap items-center gap-2 max-[600px]:items-stretch">
            <Link
              to={`/bookings/${selectedViewingId}`}
              className="ml-auto inline-flex min-h-8.5 items-center justify-center rounded-[3px] bg-[#d7b83e] px-3 text-xs font-semibold !text-[#000000] no-underline transition-colors hover:bg-[#ebd05c] max-[600px]:ml-0"
            >
              Välj platser
            </Link>
          </div>

          <p className="mt-4 text-xs text-[#aaa]">
            Välj datum och tid för att fortsätta.
          </p>
        </section>
      </div>
    </main>
  );
}
