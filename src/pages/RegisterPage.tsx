import { useState } from "react";
import { Link, useNavigate } from "react-router";

export function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Lösenorden matchar inte.");
      return;
    }

    if (password.length < 8) {
      setError("Lösenordet måste vara minst 8 tecken.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Kunde inte skapa konto."
        );
      }

      navigate("/login", {
        state: {
          message: "Kontot har skapats! Logga in för att fortsätta.",
        },
      });
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
          Skapa konto
        </h1>

        <p className="mb-8 text-center text-sm text-[#aaa59b]">
          Bli medlem och upptäck nästa filmupplevelse.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="name" className="mb-2 block text-sm">
              Namn
            </label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              required
              minLength={2}
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#6c5a31]/50 bg-[#292929] px-4 py-3 text-white outline-none transition focus:border-[#d7b83e]"
              placeholder="Ditt namn"
            />
          </div>

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
              className="w-full rounded-lg border border-[#6c5a31]/50 bg-[#292929] px-4 py-3 text-white outline-none transition focus:border-[#d7b83e]"
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
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-[#6c5a31]/50 bg-[#292929] px-4 py-3 text-white outline-none transition focus:border-[#d7b83e]"
              placeholder="Minst 8 tecken"
            />
          </div>

          <div>
            <label htmlFor="confirmPassword" className="mb-2 block text-sm">
              Bekräfta lösenord
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-lg border border-[#6c5a31]/50 bg-[#292929] px-4 py-3 text-white outline-none transition focus:border-[#d7b83e]"
              placeholder="Upprepa lösenord"
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
            {loading ? "Skapar konto..." : "Skapa konto"}
          </button>
        </form>

        <p className="mt-7 text-center text-sm text-[#aaa59b]">
          Har du redan ett konto?{" "}
          <Link to="/login" className="text-[#d7b83e] hover:underline">
            Logga in
          </Link>
        </p>
      </div>
    </main>
  );
}
