import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Movie } from "../types/movie";

function toCssBackground(value?: string | null) {
  if (!value) return undefined;

  const background = value.replace(/^background\s*:\s*/i, "").trim();

  if (background.includes("(") || background.startsWith("#")) {
    return background;
  }

  return `#${background}`;
}

export function MovieDetailsPage() {
  const { id } = useParams<{ id: string }>();

  const [movie, setMovie] = useState<Movie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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
              : `Kunde inte hämta filmen (${response.status}).`
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
    <main className="min-h-screen bg-[#121212] font-serif text-[#e4ce83]">
      <div
        className="mx-auto min-h-screen w-full max-w-[1800px] px-[5%] py-6 sm:px-8 lg:px-12 lg:py-[30px]"
        style={{
          background: toCssBackground(movie.background_color),
        }}
      >
        {/* Filmens titel och information */}
        <section className="mb-[18px] text-center">
          <h1 className="text-[clamp(2rem,5vw,3.2rem)] font-medium text-[#e5d27c]">
            {movie.title}
          </h1>

          <p className="my-1 text-sm text-[#e4ce83]">
            {movie.duration_minutes} min Från {movie.age_limit} år
          </p>

          {movie.genres?.length > 0 && (
            <p className="my-[5px] text-xs text-[#d9bb79]">
              {movie.genres.join(", ")}
            </p>
          )}
        </section>

        {/* Stor film bild med trailerknapp */}
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
              <span className="grid h-[46px] w-[46px] place-items-center rounded-full bg-[#e4ce83] pl-[3px] text-lg text-[#181818] [text-shadow:none]">
                ▶
              </span>
              <span>Se trailer</span>
            </a>
          )}
        </section>

        {/* Filmbeskrivning */}
        <p className="mx-auto mt-4 max-w-[560px] whitespace-pre-line text-[0.88rem] leading-[1.55] text-[#e4ce83]">
          {movie.description}
        </p>

        {/* Biljettpanel */}
        <section
          id="biljetter"
          className="mx-auto mt-14 w-full max-w-[480px] rounded-xl border border-[#6c5a31] bg-[#191919] p-[18px] font-sans text-[#e4ce83] sm:mt-[55px] sm:p-6"
        >
          <h2 className="mb-[18px] text-base font-normal">Biljetter</h2>

          <div className="grid grid-cols-4 gap-1.5 sm:gap-[10px]">
            {[0, 1, 2, 3].map((day) => {
              const date = new Date();
              date.setDate(date.getDate() + day);

              return (
                <div
                  className="flex min-h-[65px] flex-col items-center justify-center gap-1 rounded-[3px] bg-[#2b2b2b] text-xs text-[#dedede] sm:min-h-[75px]"
                  key={day}
                >
                  <span>
                    {date.toLocaleDateString("sv-SE", {
                      weekday: "short",
                    })}
                  </span>

                  <strong className="text-lg text-[#e4ce83]">
                    {date.getDate()}
                  </strong>

                  <span>
                    {date.toLocaleDateString("sv-SE", {
                      month: "short",
                    })}
                  </span>
                </div>
              );
            })}
          </div>

          <h3 className="mb-[10px] mt-5 text-sm font-normal">Salonger</h3>

          <div className="flex flex-wrap items-center gap-2 max-[600px]:items-stretch">
            <button
              type="button"
              className="inline-flex min-h-[34px] items-center justify-center rounded-[3px] border border-[#414141] bg-[#2b2b2b] px-3 text-xs text-[#eee] transition-colors hover:bg-[#414141]"
            >
              Stora salongen
            </button>

            <button
              type="button"
              className="inline-flex min-h-[34px] items-center justify-center rounded-[3px] border border-[#414141] bg-[#2b2b2b] px-3 text-xs text-[#eee] transition-colors hover:bg-[#414141]"
            >
              Lilla salongen
            </button>

            <Link
              to="/movies"
              className="ml-auto inline-flex min-h-[34px] items-center justify-center rounded-[3px] bg-[#d7b83e] px-3 text-xs font-semibold text-[#181818] no-underline transition-colors hover:bg-[#ebd05c] max-[600px]:ml-0"
            >
              Välj platser
            </Link>
          </div>

          <p className="mt-4 text-xs text-[#aaa]">
            Välj datum och salong för att fortsätta.
          </p>
        </section>
      </div>
    </main>
  );
}
