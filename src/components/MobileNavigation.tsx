
import { useState, useRef, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import type { FormEvent } from "react";

import {
  House,
  Search,
  CalendarDays,
  Info,
  UserRound,
  X,
  ArrowRight,
} from "lucide-react";

const navigationItems = [
  { label: "Hem", href: "/", Icon: House },
  { label: "Boka", href: "/movies", Icon: CalendarDays },
  { label: "Om oss", href: "/om-oss", Icon: Info },
  { label: "Konto", href: "/konto", Icon: UserRound },
];

export default function MobileNavigation() {
  const navigate = useNavigate();

  const [searchOpen, setSearchOpen] = useState(false);
  const [search, setSearch] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = search.trim();

    if (!query) return;

    navigate(`/movies?search=${encodeURIComponent(query)}`);

    setSearchOpen(false);
    setSearch("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
}

  return (
    <>
      {searchOpen && (
        <div
          className="
            fixed inset-x-0 bottom-[76px] z-50
            border-t border-[#806b36]
            bg-[#1d1d1d]
            p-4 shadow-[0_-10px_30px_rgba(0,0,0,0.35)]
            md:hidden
          "
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-serif text-lg text-[#e5ca7a]">
              Sök filmer
            </h2>

            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              aria-label="Stäng sökfält"
              className="rounded-full p-2 text-[#e5ca7a] hover:bg-[#333333]"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSearch} role="search">
            <div className="flex items-center gap-3 rounded-xl border border-[#806b36] bg-[#262626] px-4 focus-within:border-[#e5ca7a]">
              <Search
                size={20}
                className="shrink-0 text-[#e5ca7a]"
              />

              <input
                ref={inputRef}
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Sök efter film eller genre..."
                aria-label="Sök efter film eller genre"
                className="
                  min-w-0 flex-1 bg-transparent py-3
                  text-sm text-white outline-none
                  placeholder:text-[#b8a66e]
                "
              />

              <button
                type="submit"
                disabled={!search.trim()}
                aria-label="Utför sökning"
                className="
                  text-[#e5ca7a] transition
                  hover:text-white
                  disabled:cursor-not-allowed
                  disabled:opacity-40
                "
              >
                <ArrowRight size={20} />
              </button>
            </div>
          </form>
        </div>
      )}

      <nav
        aria-label="Huvudnavigation"
        className="
          fixed inset-x-0 bottom-0 z-50
          flex flex-row items-center justify-around
          border-t border-[#806b36]
          bg-[#1d1d1d] p-2

          md:inset-x-auto md:left-0
          md:top-20 md:bottom-0
          md:w-56
          md:flex-col md:items-stretch md:justify-start
          md:gap-3 md:border-r md:border-t-0
          md:p-4
        "
      >
        {/* Hem */}
        <Link
          to="/"
          className="
            flex flex-col items-center gap-1
            rounded-lg px-2 py-2
            text-[#e5ca7a]
            transition-colors hover:bg-[#333333]
            md:flex-row md:justify-start
            md:gap-3 md:px-2 lg:px-3
          "
        >
          <House size={24} strokeWidth={1.7} />
          <span className="text-xs md:text-sm">Hem</span>
        </Link>

        <button
          type="button"
          onClick={() => setSearchOpen(!searchOpen)}
          aria-expanded={searchOpen}
          aria-label={searchOpen ? "Stäng sökning" : "Öppna sökning"}
          className={`
            flex flex-col items-center gap-1
            rounded-lg px-2 py-2
            text-[#e5ca7a]
            transition-colors
            hover:bg-[#333333]
            md:hidden
            ${searchOpen ? "bg-[#333333]" : ""}
          `}
        >
          <Search size={24} strokeWidth={1.7} />
          <span className="text-xs">Sök</span>
        </button>

        {navigationItems
          .filter((item) => item.label !== "Hem")
          .map(({ label, href, Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setSearchOpen(false)}
              className="
                flex flex-col items-center gap-1
                rounded-lg px-2 py-2
                text-[#e5ca7a]
                transition-colors hover:bg-[#333333]

                md:flex-row md:justify-start
                md:gap-3 md:px-2 lg:px-3
              "
            >
              <Icon
                aria-hidden="true"
                size={24}
                strokeWidth={1.7}
                className="shrink-0"
              />
              <span className="text-xs md:text-sm">{label}</span>
            </Link>
          ))}
      </nav>
    </>
  );
}
