
import { useEffect, useState } from "react";

interface Movie {
  movieId: number;
  title: string;
  description: string;
  duration_minutes: number;
  poster: string;
  age_limit: number;
  genres: string[] | null;
}

export default function MovieSection() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) {
    return (
      <section aria-labelledby="movies-heading" className="py-10">
        <h2 id="movies-heading" className="mb-6 text-2xl font-bold">
          Alla filmer
        </h2>
        <p role="status">Laddar filmer...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section aria-labelledby="movies-heading" className="py-10">
        <h2 id="movies-heading" className="mb-6 text-2xl font-bold">
          Alla filmer
        </h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  return (
    <section aria-labelledby="movies-heading" className="py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h2 id="movies-heading" className="text-2xl font-bold">
          Alla filmer
        </h2>

        <p className="text-sm text-gray-400">
          {movies.length} {movies.length === 1 ? "film" : "filmer"}
        </p>
      </div>

      {movies.length === 0 ? (
        <p>Det finns inga filmer att visa just nu.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {movies.map((movie) => (
            <article
              key={movie.movieId}
              className="overflow-hidden rounded-xl border border-[#806b36] bg-[#292929] transition duration-200 hover:-translate-y-1"
            >
              {movie.poster && movie.poster.startsWith("http") ? (
                <img
                  src={movie.poster}
                  alt={`Filmaffisch för ${movie.title}`}
                  className="h-72 w-full object-cover"
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
                    {movie.duration_minutes} min
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
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
