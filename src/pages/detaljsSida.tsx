
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Movie } from "../types/movie";
import "../styles/detaljsSida.css";

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
    return <p className="movie-status">Laddar film...</p>;
  }

  if (error || !movie) {
    return (
      <main className="movie-details">
        <p>{error || "Filmen hittades inte."}</p>
        <Link to="/">Tillbaka till startsidan</Link>
      </main>
    );
  }

  return (
    <main className="movie-details">
      <Link to="/" className="back-link">
        ← Tillbaka till filmer
      </Link>

      <section className="movie-hero">
        {movie.poster && (
          <img
            className="movie-poster"
            src={movie.poster}
            alt={`Affisch för ${movie.title}`}
          />
        )}

        <div className="movie-info">
          <p className="movie-eyebrow">FILMVISARNA</p>

          <h1>{movie.title}</h1>

          <div className="movie-meta">
            <span>{movie.duration_minutes} min</span>
            <span>{movie.age_limit}+ år</span>
          </div>

          <div className="movie-genres">
            {movie.genres?.map((genre) => (
              <span className="genre-tag" key={genre}>
                {genre}
              </span>
            ))}
          </div>

          <h2>Om filmen</h2>
          <p className="movie-description">
            {movie.description}
          </p>

          {movie.trailer && (
            <section className="trailer-section">
              <h2>Trailer</h2>
              <a
                href={movie.trailer}
                target="_blank"
                rel="noreferrer"
              >
                Se filmens trailer ↗
              </a>
            </section>
          )}
        </div>
      </section>
    </main>
  );
}
