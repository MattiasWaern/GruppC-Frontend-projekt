
import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface Movie {
  movieId: number;
  title: string;
}

interface Event {
  eventId: number;
  title: string;
  categoryName: string;
}

interface Theater {
  theaterId: number;
  name: string;
}

const API_URL = "/api";

export default function AddViewing() {
  const { token, isAdmin } = useAuth();

  const [movies, setMovies] = useState<Movie[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [theaters, setTheaters] = useState<Theater[]>([]);

  const [contentType, setContentType] = useState<"movie" | "event">("movie");
  const [contentId, setContentId] = useState("");
  const [viewingDate, setViewingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [theaterId, setTheaterId] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [movieResponse, eventResponse, theaterResponse] =
          await Promise.all([
            fetch(`${API_URL}/movies`),
            fetch(`${API_URL}/events`),
            fetch(`${API_URL}/theaters`),
          ]);

        if (!movieResponse.ok || !eventResponse.ok || !theaterResponse.ok) {
          throw new Error("Kunde inte hämta filmer, evenemang eller salonger.");
        }

        const movieData = await movieResponse.json();
        const eventData = await eventResponse.json();
        const theaterData = await theaterResponse.json();

        console.log("Filmer:", movieData);
        console.log("Evenemang:", eventData);
        console.log("Salonger:", theaterData);

        setMovies(movieData);
        setEvents(eventData);
        setTheaters(theaterData);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Något gick fel."
        );
      }
    };

    fetchOptions();
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!token || !isAdmin) {
      setMessage("Du saknar behörighet att lägga till visningar.");
      return;
    }

    if (!contentId) {
      setMessage("Välj en film eller ett evenemang.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/viewings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          viewing:
            contentType === "movie"
              ? movies.find((movie) => movie.movieId === Number(contentId))?.title
              : events.find((event) => event.eventId === Number(contentId))?.title,
          viewing_date: viewingDate,
          viewing_start_time: startTime,
          movieId: contentType === "movie" ? Number(contentId) : null,
          eventId: contentType === "event" ? Number(contentId) : null,
          theaterId: Number(theaterId),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte skapa visningen.");
      }

      setMessage(`Visningen har skapats! Visnings-ID: ${data.viewingId}`);

      setContentId("");
      setViewingDate("");
      setStartTime("");
      setTheaterId("");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Något gick fel."
      );
    } finally {
      setLoading(false);
    }
  };

  const options = contentType === "movie" ? movies : events;

  return (
    <main className="min-h-screen bg-[#1d1d1d] px-4 py-12 text-[#e5ca7a]">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">Lägg till visning</h1>

        <p className="mb-8 text-gray-400">
          Välj film eller evenemang och ange datum, tid och salong.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block">Typ av visning</label>
            <select
              value={contentType}
              onChange={(e) => {
                setContentType(e.target.value as "movie" | "event");
                setContentId("");
              }}
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            >
              <option value="movie">Film</option>
              <option value="event">Evenemang</option>
            </select>
          </div>

          <div>
            <label className="mb-2 block">
              {contentType === "movie" ? "Välj film" : "Välj evenemang"}
            </label>
            <select
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            >
              <option value="">Välj...</option>
              {options.map((item) => (
                <option
                  key={contentType === "movie" ? (item as Movie).movieId : (item as Event).eventId}
                  value={contentType === "movie" ? (item as Movie).movieId : (item as Event).eventId}
                >
                  {contentType === "event"
                  ? `${item.title} – ${(item as Event).categoryName}`
                  : item.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block">Datum</label>
            <input
              type="date"
              value={viewingDate}
              onChange={(e) => setViewingDate(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Starttid</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Salong</label>
            <select
              value={theaterId}
              onChange={(e) => setTheaterId(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            >
              <option value="">Välj salong...</option>
              {theaters.map((theater) => (
                <option key={theater.theaterId} value={theater.theaterId}>
                  {theater.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#e5ca7a] px-6 py-3 font-bold text-black transition hover:bg-[#d3b65f] disabled:opacity-50"
          >
            {loading ? "Sparar visning..." : "Lägg till visning"}
          </button>

          {message && (
            <p role="status" className="rounded-lg bg-[#292929] p-4">
              {message}
            </p>
          )}
        </form>
      </div>
    </main>
  );
}
