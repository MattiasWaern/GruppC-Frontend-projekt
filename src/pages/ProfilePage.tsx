
import { Link, Navigate, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main className="min-h-screen bg-[#121212] px-4 py-28 font-sans text-[#e4ce83]">
      <div className="mx-auto w-full max-w-3xl">

        <div className="mb-8 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[#c9a75b]">
            Filmvisarna
          </p>

          <h1 className="font-serif text-4xl text-[#f1e3be]">
            Min profil
          </h1>

          <p className="mt-3 text-sm text-[#aaa59b]">
            Hantera ditt konto och dina uppgifter.
          </p>
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#6c5a31]/50 bg-[#1b1b1b] shadow-2xl">

          <div className="flex items-center gap-5 border-b border-[#6c5a31]/40 p-6 sm:p-8">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border border-[#b99b4c] bg-[#292929] font-serif text-3xl text-[#e5ca7a]">
              {user.name.charAt(0).toUpperCase()}
            </div>

            <div>
              <h2 className="font-serif text-2xl text-[#f1e3be]">
                {user.name}
              </h2>

              <p className="mt-1 text-sm text-[#aaa59b]">
                Medlem hos Filmvisarna
              </p>
            </div>
          </div>

          <div className="space-y-6 p-6 sm:p-8">
            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-[#aaa59b]">
                Namn
              </p>

              <p className="text-lg text-[#f1e3be]">
                {user.name}
              </p>
            </div>

            <div>
              <p className="mb-1 text-xs uppercase tracking-wider text-[#aaa59b]">
                E-postadress
              </p>

              <p className="text-lg text-[#f1e3be]">
                {user.email}
              </p>
            </div>

            <div className="border-t border-[#6c5a31]/40 pt-6">
              <h3 className="mb-2 font-serif text-xl text-[#f1e3be]">
                Mina bokningar
              </h3>

              <p className="mb-4 text-sm text-[#aaa59b]">
                Här kommer du snart kunna se dina tidigare
                och kommande biobokningar.
              </p>

              <Link
                to="/movies"
                className="inline-block rounded-lg border border-[#b99b4c] px-5 py-2.5 text-sm text-[#e5ca7a] transition hover:bg-[#b99b4c] hover:text-black"
              >
                Utforska filmer
              </Link>
            </div>
          </div>
        </section>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg border border-red-900/70 px-6 py-3 text-sm text-red-300 transition hover:bg-red-950/50"
          >
            Logga ut
          </button>
        </div>
      </div>
    </main>
  );
}
