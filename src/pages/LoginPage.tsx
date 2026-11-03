
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const message = (
    location.state as { message?: string } | null
  )?.message;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    try {
      setLoading(true);

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Inloggningen misslyckades."
        );
      }

      // Enkel lösning för lokal utveckling.
      // För produktion bör token hanteras med
      // säkra HttpOnly-cookies.
      localStorage.setItem("token", data.token);
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Något gick fel."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#121212] px-4 py-24 font-sans text-[#e4ce83]">
      <div className="w-full max-w-md rounded-2xl border border-[#6c5a31]/50 bg-[#1b1b1b] p-7 shadow-2xl sm:p-10">
        <p className="mb-3 text-center text-xs uppercase tracking-[0.3em] text-[#c9a75b]">
          Filmvisarna
        </p>

        <h1 className="mb-3 text-center font-serif text-3xl text-[#f1e3be]">
          Välkommen tillbaka
        </h1>

        <p className="mb-8 text-center text-sm text-[#aaa59b]">
          Logga in för att fortsätta till Filmvisarna.
        </p>

        {message && (
          <p className="mb-5 rounded-lg border border-[#6c5a31] bg-[#292929] p-3 text-sm text-[#e4ce83]">
            {message}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="mb-2 block text-sm">
              E-postadress
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-[#6c5a31]/50 bg-[#292929] px-4 py-3 text-white outline-none focus:border-[#d7b83e]"
              placeholder="namn@exempel.se"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-2 block text-sm">
              Lösenord
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#6c5a31]/50 bg-[#292929] px-4 py-3 text-white outline-none focus:border-[#d7b83e]"
              placeholder="Ditt lösenord"
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#d7b83e] px-5 py-3 font-semibold text-[#181818] transition hover:bg-[#ebd05c] disabled:opacity-50"
          >
            {loading ? "Loggar in..." : "Logga in"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#aaa59b]">
          Har du inget konto?{" "}
          <Link to="/register" className="text-[#d7b83e] hover:underline">
            Skapa konto
          </Link>
        </p>
      </div>
    </main>
  );
}
