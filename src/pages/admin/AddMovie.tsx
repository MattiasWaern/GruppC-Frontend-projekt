import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";

interface Genre {
  genreId: number;
  name: string;
}

interface MovieForm {
  title: string;
  description: string;
  duration_minutes: string;
  trailer: string;
  poster: string;
  background_color: string;
  age_limit: string;
  director: string;
  actors: string;
  original_title: string;
  original_language: string;
  premiere: string;
}

//const API_URL = "http://localhost:3000/api";//
const API_URL = "/api";

const AddMovie = () => {
  const { token, isAdmin } = useAuth();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<MovieForm>({
    title: "",
    description: "",
    duration_minutes: "",
    trailer: "",
    poster: "",
    background_color: "#1d1d1d",
    age_limit: "0",
    director: "",
    actors: "",
    original_title: "",
    original_language: "",
    premiere: "",
  });

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(`${API_URL}/genres`);

        if (!response.ok) {
          throw new Error("Kunde inte hämta genrer.");
        }

        const data: Genre[] = await response.json();
        setGenres(data);
      } catch (error) {
        setMessage(
          error instanceof Error
            ? error.message
            : "Något gick fel."
        );
      }
    };

    fetchGenres();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleGenreChange = (genreId: number) => {
    setSelectedGenres((current) =>
      current.includes(genreId)
        ? current.filter((id) => id !== genreId)
        : [...current, genreId]
    );
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();
    setMessage("");

    if (!token) {
      setMessage("Du måste vara inloggad som administratör.");
      return;
    }

    if (!isAdmin) {
    setMessage("Du saknar behörighet att lägga till filmer.");
    return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/movies`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          duration_minutes: Number(form.duration_minutes),
          age_limit: Number(form.age_limit),
          genreIds: selectedGenres,
          trailer: form.trailer || null,
          poster: form.poster || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte skapa filmen.");
      }

      setMessage(`Filmen har skapats! Film-ID: ${data.movieId}`);

      setForm({
        title: "",
        description: "",
        duration_minutes: "",
        trailer: "",
        poster: "",
        background_color: "#1d1d1d",
        age_limit: "0",
        director: "",
        actors: "",
        original_title: "",
        original_language: "",
        premiere: "",
      });

      setSelectedGenres([]);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Något gick fel."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1d1d1d] px-4 py-12 text-[#e5ca7a]">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">
          Lägg till film
        </h1>

        <p className="mb-8 text-gray-400">
          Fyll i informationen för den nya filmen.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block">Filmtitel</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Beskrivning</label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Regi</label>
            <input
              name="director"
              value={form.director}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Skådespelare</label>
            <textarea
              name="actors"
              value={form.actors}
              onChange={handleChange}
              rows={3}
              placeholder="Exemmpel: Johnny Depp, Helena Bonham Carter, Cillian Murphy"
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Orginaltitel</label>
            <input 
              name="original_title"
              value={form.original_title}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Orginalspråk</label>
            <input
              name="original_language"
              value={form.original_language}
              onChange={handleChange}
              placeholder="Exempel: Engelska"
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Premiär</label>
            <input
              type="date"
              name="premiere"
              value={form.premiere}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-2 block">Speltid (minuter)</label>
              <input
                type="number"
                name="duration_minutes"
                value={form.duration_minutes}
                onChange={handleChange}
                min="1"
                required
                className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
              />
            </div>

            <div>
              <label className="mb-2 block">Åldersgräns</label>
              <input
                type="number"
                name="age_limit"
                value={form.age_limit}
                onChange={handleChange}
                min="0"
                required
                className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 block">Trailer (URL)</label>
            <input
              type="url"
              name="trailer"
              value={form.trailer}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Poster (URL)</label>
            <input
              type="url"
              name="poster"
              value={form.poster}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Bakgrundsfärg</label>
            <input
              type="color"
              name="background_color"
              value={form.background_color}
              onChange={handleChange}
              className="h-12 w-full cursor-pointer rounded-lg"
            />
          </div>

          <div>
            <label className="mb-3 block">Genrer</label>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {genres.map((genre) => (
                <label
                  key={genre.genreId}
                  className="flex items-center gap-2 rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
                >
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(genre.genreId)}
                    onChange={() => handleGenreChange(genre.genreId)}
                  />
                  {genre.name}
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#e5ca7a] px-6 py-3 font-bold text-black transition hover:bg-[#d3b65f] disabled:opacity-50"
          >
            {loading ? "Sparar film..." : "Lägg till film"}
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
};

export default AddMovie;
