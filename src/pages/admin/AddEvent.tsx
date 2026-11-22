import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useAuth } from "../../context/AuthContext";

interface EventCategory {
  categoryId: number;
  name: string;
}

interface EventForm {
  title: string;
  date: string;
  description: string;
  poster: string;
  categoryId: string;
  extraInfo: string;
}

const API_URL = "/api";

const AddEvent = () => {

  console.log("AddEvent-komponenten visas");

  const { token, isAdmin } = useAuth();

  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [form, setForm] = useState<EventForm>({
    title: "",
    date: "",
    description: "",
    poster: "",
    categoryId: "",
    extraInfo: "",
  });

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_URL}/eventcategory`);
        
        console.log("Kategori-status:", response.status);
        console.log("Kategori-URL:", response.url);

        if (!response.ok) {
          throw new Error("Kunde inte hämta eventkategorier.");
        }

        const data: EventCategory[] = await response.json();
        setCategories(data);
      } catch (error) {
        setMessage(
          error instanceof Error ? error.message : "Något gick fel."
        );
      }
    };

    fetchCategories();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");

    if (!token || !isAdmin) {
      setMessage("Du måste vara inloggad som administratör.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/events`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...form,
          categoryId: Number(form.categoryId),
          description: form.description || null,
          poster: form.poster || null,
          extraInfo: form.extraInfo || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Kunde inte skapa evenemanget.");
      }

      setMessage(`Evenemanget har skapats! ID: ${data.eventId}`);

      setForm({
        title: "",
        date: "",
        description: "",
        poster: "",
        categoryId: "",
        extraInfo: "",
      });
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Något gick fel."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#1d1d1d] px-4 py-12 text-[#e5ca7a]">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold">Lägg till evenemang</h1>

        <p className="mb-8 text-gray-400">
          Fyll i informationen för det nya evenemanget.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block">Titel</label>
            <input
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <div>
            <label className="mb-2 block">Datum</label>
            <input
              type="date"
              name="date"
              value={form.date}
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
              rows={4}
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
            <label className="mb-2 block">Kategori</label>
            <select
              name="categoryId"
              value={form.categoryId}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            >
              <option value="">Välj kategori</option>
              {categories.map((category) => (
                <option key={category.categoryId} value={category.categoryId}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-2 block">Extra information</label>
            <textarea
              name="extraInfo"
              value={form.extraInfo}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-gray-700 bg-[#292929] p-3 text-white"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#e5ca7a] px-6 py-3 font-bold text-black transition hover:bg-[#d3b65f] disabled:opacity-50"
          >
            {loading ? "Sparar evenemang..." : "Lägg till evenemang"}
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

export default AddEvent;
