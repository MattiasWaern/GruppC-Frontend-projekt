
import { Link, Navigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function AdminDashboard() {
  const { user, isAdmin, logout } = useAuth();

  // Endast Admin och Product Owner får se sidan
  if (!user) {
    return (
      <Navigate
        to="/login"
        state={{ message: "Logga in för att fortsätta." }}
        replace
      />
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <section className="min-h-[70vh] py-10 text-[#e5ca7a]">
      <div className="mx-auto max-w-5xl">

        <div className="mb-10">
          <p className="mb-2 text-sm uppercase tracking-[0.25em] text-[#c9a75b]">
            Filmvisarna
          </p>

          <h1 className="mb-3 text-4xl font-bold">
            Admin Dashboard
          </h1>

          <p className="text-gray-400">
            Välkommen {user.name}! Här kan du administrera filmer
            och visningar.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">

          <Link
            to="/admin/movies/new"
            className="rounded-xl border border-[#6c5a31]/50 bg-[#292929] p-6 transition hover:border-[#e5ca7a] hover:bg-[#333333]"
          >
            <h2 className="mb-3 text-xl font-semibold">
              Lägg till film
            </h2>

            <p className="text-sm text-gray-400">
              Skapa nya filmer och välj genrer, beskrivning,
              poster och åldersgräns.
            </p>
          </Link>

          <Link
            to="/admin/viewings/new"
            className="rounded-xl border border-[#6c5a31]/50 bg-[#292929] p-6 transition hover:border-[#e5ca7a] hover:bg-[#333333]"
          >
            <h2 className="mb-3 text-xl font-semibold">
              Lägg till visning
            </h2>

            <p className="text-sm text-gray-400">
              Schemalägg filmvisningar med datum, tid och salong.
            </p>
          </Link>

        </div>

        <div className="mt-10 flex items-center justify-between border-t border-gray-700 pt-6">
          <p className="text-sm text-gray-400">
            Inloggad som{" "}
            {user.role === 3 ? "Admin" : "Product Owner"}
          </p>

          <button
            onClick={logout}
            className="rounded-lg border border-[#6c5a31] px-4 py-2 text-sm transition hover:bg-[#292929]"
          >
            Logga ut
          </button>
        </div>

      </div>
    </section>
  );
}
