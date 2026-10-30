
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Movie } from "../types/movie";

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";

  useEffect(() => {
    const controller = new AbortController();

    async function fetchMovies() {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/movies", {
          signal: controller.signal,
        });

        if (!response.ok) {
          throw new Error(
            `Kunde inte hämta filmer (${response.status}).`
          );
        }

        const data: Movie[] = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Ogiltigt svar från servern.");
        }

        setMovies(data);
      } catch (err) {
        if (
          err instanceof Error &&
          err.name !== "AbortError"
        ) {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    fetchMovies();

    return () => controller.abort();
  }, []);

  const filteredMovies = useMemo(() => {
    const query = search.toLocaleLowerCase("sv-SE");

    if (!query) return movies;

    return movies.filter((movie) => {
      const title = (movie.title ?? "")
        .toLocaleLowerCase("sv-SE");

      const genres = (movie.genres ?? [])
        .join(" ")
        .toLocaleLowerCase("sv-SE");

      const description = (movie.description ?? "")
        .toLocaleLowerCase("sv-SE");

      return (
        title.includes(query) ||
        genres.includes(query) ||
        description.includes(query)
      );
    });
  }, [movies, search]);

  if (loading) {
    return (
      <main className="min-h-screen bg-[#121212] p-10 text-center text-[#e4ce83]">
        Laddar filmer...
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen bg-[#121212] p-10 text-center text-red-400">
        {error}
      </main>
    );
  }

return (
  <main className="min-h-screen bg-[#121212] px-4 pb-20 pt-24 font-serif text-[#e4ce83] sm:px-8 lg:px-12">
    <div className="mx-auto max-w-7xl">

      {/* Sidhuvud */}
      <header className="mb-10 border-b border-[#6c5a31]/50 pb-8">

        <h1 className="mb-3 text-4xl font-medium tracking-wide text-[#f1e3be] sm:text-5xl">
          {search
            ? `Sökresultat för "${search}"`
            : "Upptäck filmer"}
        </h1>

        <p className="font-sans text-sm text-[#aaa59b] sm:text-base">
          {search
            ? `${filteredMovies.length} ${
                filteredMovies.length === 1
                  ? "film hittades"
                  : "filmer hittades"
              }`
            : "Utforska vårt filmutbud och hitta din nästa bioupplevelse."}
        </p>
      </header>

      {/* Tillbaka till alla filmer vid sökning */}
      {search && (
        <div className="mb-8">
          <Link
            to="/movies"
            className="inline-flex items-center gap-2 font-sans text-sm text-[#d7b83e] transition hover:text-[#f1e3be]"
          >
            <span aria-hidden="true">←</span>
            Visa alla filmer
          </Link>
        </div>
      )}

      {/* Inga sökresultat */}
      {filteredMovies.length === 0 ? (
        <div className="flex min-h-72 flex-col items-center justify-center rounded-xl border border-[#6c5a31]/50 bg-[#1b1b1b] px-6 text-center">
          <h2 className="mb-3 text-2xl text-[#f1e3be]">
            Inga filmer hittades
          </h2>

          <p className="mb-6 max-w-md font-sans text-sm leading-relaxed text-[#aaa59b]">
            Vi kunde inte hitta någon film som matchade din sökning.
            Prova ett annat sökord eller utforska alla våra filmer.
          </p>

          <Link
            to="/movies"
            className="rounded-md bg-[#d7b83e] px-6 py-3 font-sans text-sm font-semibold text-[#181818] transition hover:bg-[#ebd05c]"
          >
            Visa alla filmer
          </Link>
        </div>
      ) : (

        /* Filmkort */
        <div className="grid grid-cols-1 gap-7 sm:grid-cols-2 lg:grid-cols-3 xl:gap-9">
          {filteredMovies.map((movie) => (
            <Link
              key={movie.movieId}
              to={`/movies/${movie.movieId}`}
              className="group overflow-hidden rounded-xl border border-[#6c5a31]/40 bg-[#1b1b1b] shadow-lg shadow-black/20 transition-all duration-300 hover:-translate-y-1 hover:border-[#d7b83e] hover:shadow-xl hover:shadow-black/40"
            >

              {/* Filmbild */}
              <div className="relative aspect-[3/4] overflow-hidden bg-[#252525]">
                {movie.poster ? (
                  <img
                    src={movie.poster}
                    alt={`Affisch för ${movie.title}`}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center px-5 text-center text-[#c9a75b]">
                    Ingen filmaffisch tillgänglig
                  </div>
                )}

                {/* Mörk gradient längst ner */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                {/* Åldersgräns */}
                <span className="absolute right-4 top-4 rounded-md border border-white/20 bg-black/70 px-3 py-1 font-sans text-xs text-white backdrop-blur-sm">
                  {movie.age_limit} år
                </span>
              </div>

              {/* Filminformation */}
              <div className="flex min-h-40 flex-col p-5 sm:p-6">
                <h2 className="mb-2 text-2xl font-medium text-[#f1e3be] transition-colors group-hover:text-[#d7b83e]">
                  {movie.title}
                </h2>

                <p className="mb-4 font-sans text-sm text-[#b9a980]">
                  {movie.genres?.length
                    ? movie.genres.join(" · ")
                    : "Film"}
                </p>

                <div className="mt-auto flex items-center justify-between border-t border-[#6c5a31]/40 pt-4">
                  <span className="font-sans text-sm text-[#aaa59b]">
                    {movie.duration_minutes} min
                  </span>

                  <span className="flex items-center gap-2 font-sans text-sm font-medium text-[#d7b83e]">
                    Läs mer
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  </main>
);
}
