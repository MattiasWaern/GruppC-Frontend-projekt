import { Link, useNavigate } from "react-router";
import { useEffect, useState } from "react";

interface Movie {
  movieId: number;
  title: string;
  description: string;
  duration_minutes: number;
  poster: string;
  age_limit: number;
  genres: string[] | null;
  director: string | null;
  actors: string | null;
  original_title: string | null;
  original_language: string | null;
  premiere: string | null;
}

export default function MovieSection() {
  const navigate = useNavigate();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [ageFilter, setAgeFilter] = useState("all");

  function formatRuntime(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} minuter`;
  }

  if (remainingMinutes === 0) {
    return `${hours} ${hours === 1 ? "timme" : "timmar"}`;
  }

  return `${hours} h och ${remainingMinutes} minuter`;
}

  useEffect(() => {
    async function fetchMovies() {
      try {
        const response = await fetch("/api/movies");

        if (!response.ok) {
          throw new Error("Kunde inte hämta filmerna.");
        }

        const data: Movie[] = await response.json();
        setMovies(data);
      } catch (error) {
        console.error("Fel vid hämtning av filmer:", error);
        setError("Det gick inte att hämta filmerna.");
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  function handleShowMovies() {
    const params = new URLSearchParams();

    if (selectedDate) {
      params.set("date", selectedDate);
    }

    params.set("age", ageFilter);

    // Stäng filterpanelen innan besökaren går vidare
    setFiltersOpen(false);

    navigate(`/movies?${params.toString()}`);
  }

  if (loading) {
    return (
      <section id="movies" aria-labelledby="movies-heading" className="py-10">
        <h2 id="movies-heading" className="mb-6 text-2xl font-bold">
          Alla filmer
        </h2>
        <p role="status">Laddar filmer...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section id="movies" aria-labelledby="movies-heading" className="py-10">
        <h2 id="movies-heading" className="mb-6 text-2xl font-bold">
          Alla filmer
        </h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section
      id="movies"
      aria-labelledby="movies-heading"
      className="py-10"
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="movies-heading" className="text-2xl font-bold">
          Alla filmer
        </h2>

        <p className="text-sm text-gray-400">
          {movies.length} {movies.length === 1 ? "film" : "filmer"}
        </p>
      </div>

      {/* Filterknapp */}
      <div className="mb-8">
        <button
          type="button"
          onClick={() => setFiltersOpen((open) => !open)}
          aria-expanded={filtersOpen}
          aria-controls="movie-filters"
          className="flex w-full items-center justify-between rounded-xl border border-[#806b36] bg-[#292929] p-4 text-left transition hover:border-[#d7b83e]"
        >
          <span className="flex items-center gap-3 font-semibold text-[#e5ca7a]">
            <span aria-hidden="true">☷</span>
            Filtrera filmer
          </span>

          <span className="text-[#e5ca7a]">
            {filtersOpen ? "▲" : "▼"}
          </span>
        </button>

        {/* Filterpanelen visas bara när knappen är öppen */}
        {filtersOpen && (
          <div
            id="movie-filters"
            className="mt-3 rounded-xl border border-[#806b36]/70 bg-[#222222] p-5 sm:p-6"
          >
            {/* Datumfilter */}
            <div className="mb-6">
              <label
                htmlFor="homepage-viewing-date"
                className="mb-2 block text-sm font-medium text-[#e5ca7a]"
              >
                Välj datum
              </label>

              <input
                id="homepage-viewing-date"
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="rounded-md border border-[#806b36] bg-[#292929] px-3 py-2 text-white"
              />
            </div>

            {/* Åldersfilter */}
            <div className="mb-6">
              <p className="mb-3 text-sm font-medium text-[#e5ca7a]">
                Välj åldersgräns
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { value: "all", label: "Alla filmer" },
                  { value: "7", label: "Från 7 år" },
                  { value: "11", label: "Från 11 år" },
                  { value: "15", label: "Från 15 år" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setAgeFilter(option.value)}
                    aria-pressed={ageFilter === option.value}
                    className={`rounded-lg border px-4 py-2.5 text-sm transition ${
                      ageFilter === option.value
                        ? "border-[#d7b83e] bg-[#d7b83e] font-semibold text-[#181818]"
                        : "border-[#806b36]/60 bg-[#292929] text-[#e4ce83] hover:border-[#d7b83e]"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Visa filmer */}
            <button
              type="button"
              onClick={handleShowMovies}
              className="w-full rounded-lg bg-[#d7b83e] px-6 py-3 font-semibold text-[#181818] transition hover:bg-[#ebd05c]"
            >
              Visa filmer
            </button>
          </div>
        )}
      </div>

      {/* Befintliga filmkort */}
      {movies.length === 0 ? (
        <p>Det finns inga filmer att visa just nu.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-5">
          {movies.map((movie) => (
            <Link
              key={movie.movieId}
              to={`/movies/${movie.movieId}`}
              className="block overflow-hidden rounded-xl border border-[#806b36] bg-[#292929] transition duration-200 hover:-translate-y-1"
            >
              {movie.poster && movie.poster.startsWith("http") ? (
                <img
                  src={movie.poster}
                  alt={`Filmaffisch för ${movie.title}`}
                  className="aspect-[2/3] w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="flex h-72 items-center justify-center bg-[#353535] text-gray-400">
                  Ingen filmaffisch
                </div>
              )}

              <div className="p-4">
                <h3 className="text-lg font-bold text-[#e5ca7a]">
                  {movie.title}
                </h3>

                <p className="mt-2 line-clamp-4 text-sm leading-6 text-gray-300">
                  {movie.description || "Ingen beskrivning tillgänglig."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2 text-sm text-gray-300">
                  <span className="rounded-md bg-[#3a3a3a] px-3 py-1">
                    {formatRuntime(movie.duration_minutes)}
                  </span>

                  <span className="rounded-md bg-[#3a3a3a] px-3 py-1">
                    Från {movie.age_limit} år
                  </span>
                </div>

                {movie.genres && movie.genres.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {movie.genres.map((genre, index) => (
                      <span
                        key={`${genre}-${index}`}
                        className="rounded-full border border-[#806b36] px-3 py-1 text-xs text-[#e5ca7a]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
