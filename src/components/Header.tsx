
import { useNavigate} from "react-router";
import type { FormEvent } from "react";

export default function Header() {
  const navigate = useNavigate();

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const search = String(formData.get("search") ?? "").trim();

    if (!search) return;

    navigate(`/movies?search=${encodeURIComponent(search)}`);
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#806b36] bg-[#1d1d1d]">
      <div className="mx-auto flex min-h-[76px] max-w-7xl items-center justify-between gap-4 px-4 md:px-8">


        <button
          type="button"
          onClick={() => navigate("/")}
          aria-label="Gå till startsidan"
          className="shrink-0 cursor-pointer"
        >
           <img
            src="/public/images/logo.png"
            alt="Filmvisarna"
            className="h-auto w-40 object-contain sm:w-48 md:w-56"
          />
        </button>


        <form
          role="search"
          onSubmit={handleSearch}
          className="hidden max-w-md flex-1 md:block"
        >
          <label htmlFor="desktop-search" className="sr-only">
            Sök efter film eller genre
          </label>

          <div className="flex items-center rounded-full border border-[#806b36] bg-[#262626] px-4 transition focus-within:border-[#e5ca7a]">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              className="mr-3 h-5 w-5 shrink-0 text-[#e5ca7a]"
            >
              <circle cx="10.8" cy="10.8" r="6.8" />
              <path d="m16 16 4.2 4.2" />
            </svg>

            <input
              id="desktop-search"
              name="search"
              type="search"
              placeholder="Sök efter film eller genre..."
              className="w-full bg-transparent py-3 text-sm text-white outline-none placeholder:text-[#e5ca7a]"
            />

            <button
              type="submit"
              aria-label="Sök"
              className="text-[#e5ca7a] hover:text-white"
            >
              Sök
            </button>
          </div>
        </form>

         <button
          type="button"
          onClick={() => navigate("/profil")}
          aria-label="Gå till startsidan"
          className="shrink-0 cursor-pointer rounded-full border border-[#b99b4c] px-4 py-2 font-serif text-sm text-[#e5ca7a] transition-colors hover:bg-[#b99b4c] hover:text-black"
        >
           Min profil
        </button>
      </div>
    </header>
  );
}
