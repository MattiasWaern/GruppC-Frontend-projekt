
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import type { Movie } from "../types/movie";
import "../styles/detaljsSida.css";

function toCssBackground(value?: string) {
  if (!value) return undefined;

  // Gradient eller hex med #
  if (value.includes("(") || value.startsWith("#")) {
    return value;
  }

  // Hex utan #
  return `#${value}`;
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
    return <p className="movie-status">Laddar film...</p>;
  }

  if (error || !movie) {
    return (
      <main className="movie-details">
        <p>{error || "Filmen hittades inte."}</p>
        <Link to="/movies" className="back-link">
          Tillbaka till filmer
        </Link>
      </main>
    );
  }

  return (
    <main className="movie-details">
      <div
        className="movie-content"
        style={{
          background: toCssBackground(movie.background_color),
        }}
      >
        <section className="movie-intro">
          <h1>{movie.title}</h1>

          <p className="movie-subtitle">
            {movie.duration_minutes} min Från {movie.age_limit} år
          </p>

          {movie.genres?.length > 0 && (
            <p className="movie-genre-line">
              {movie.genres.join(", ")}
            </p>
          )}
        </section>

        <section className="movie-trailer">
          {movie.poster ? (
            <img
              className="movie-poster"
              src={movie.poster}
              alt={`Affisch för ${movie.title}`}
            />
          ) : (
            <div className="movie-poster-placeholder">
              {movie.title}
            </div>
          )}

          {movie.trailer && (
            <a
              className="trailer-play"
              href={movie.trailer}
              target="_blank"
              rel="noreferrer"
              aria-label={`Se trailer för ${movie.title}`}
            >
              <span className="play-icon">▶</span>
              <span>Se trailer</span>
            </a>
          )}
        </section>

        <p className="movie-description">
          {movie.description}
        </p>

        <section className="ticket-panel" id="biljetter">
          <h2>Biljetter</h2>

          <div className="date-options">
            {[0, 1, 2, 3].map((day) => {
              const date = new Date();
              date.setDate(date.getDate() + day);

              return (
                <div className="date-option" key={day}>
                  <span>
                    {date.toLocaleDateString("sv-SE", {
                      weekday: "short",
                    })}
                  </span>
                  <strong>{date.getDate()}</strong>
                  <span>
                    {date.toLocaleDateString("sv-SE", {
                      month: "short",
                    })}
                  </span>
                </div>
              );
            })}
          </div>

          <h3>Salonger</h3>

          <div className="theater-options">
            <button type="button" className="theater-button">
              Stora salongen
            </button>

            <button type="button" className="theater-button">
              Lilla salongen
            </button>

            <Link to="/movies" className="choose-seats-button">
              Välj platser
            </Link>
          </div>

          <p className="ticket-note">
            Välj datum och salong för att fortsätta.
          </p>
        </section>
      </div>
    </main>
  );
}
