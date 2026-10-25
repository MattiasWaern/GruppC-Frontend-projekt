import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router";
import type { Movie } from "../types/movie";

export function MoviesPage() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchParams] = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";

  useEffect(() => {
    async function fetchMovies() {
      try {
        setLoading(true);

        const response = await fetch("/api/movies");

        if (!response.ok) {
          throw new Error("Kunde inte hämta filmer.");
        }

        const data: Movie[] = await response.json();
        setMovies(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Något gick fel."
        );
      } finally {
        setLoading(false);
      }
    }

    fetchMovies();
  }, []);

  const filteredMovies = movies.filter((movie) => {
    const query = search.toLocaleLowerCase("sv-SE");

    const title = movie.title.toLocaleLowerCase("sv-SE");
    const genres = (movie.genres ?? [])
      .join(" ")
      .toLocaleLowerCase("sv-SE");

    return title.includes(query) || genres.includes(query);
  });

  if (loading) {
    return <p className="p-10 text-white">Laddar filmer...</p>;
  }

  if (error) {
    return <p className="p-10 text-red-400">{error}</p>;
  }

  return (
    <main className="min-h-screen bg-[#121212] px-6 pb-12 pt-28 text-[#e4ce83]">
      <div className="mx-auto max-w-7xl">

        <h1 className="mb-6 font-serif text-3xl">
          {search ? `Sökresultat för "${search}"` : "Alla filmer"}
        </h1>

        <p className="mb-6 text-sm text-[#c7b98c]">
          {filteredMovies.length} filmer hittades
        </p>

        {filteredMovies.length === 0 ? (
          <div className="rounded-xl border border-[#806b36] p-8 text-center">
            <p>Inga filmer matchade din sökning.</p>

            <Link
              to="/movies"
              className="mt-4 inline-block text-[#e5ca7a] underline"
            >
              Visa alla filmer
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredMovies.map((movie) => (
              <Link
                key={movie.movieId}
                to={`/movies/${movie.movieId}`}
                className="overflow-hidden rounded-xl border border-[#806b36] bg-[#1d1d1d] transition hover:border-[#e5ca7a]"
              >
                <img
                  src={movie.poster}
                  alt={movie.title}
                  className="aspect-video w-full object-cover"
                />

                <div className="p-5">
                  <h2 className="font-serif text-xl">
                    {movie.title}
                  </h2>

                  <p className="mt-2 text-sm text-[#c7b98c]">
                    {movie.genres?.join(", ")}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </main>
  );
}
