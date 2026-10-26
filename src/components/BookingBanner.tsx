import { Ticket } from 'lucide-react';

export default function BookingBanner() {
  return (
    <section className="hidden md:block px-3 py-5 sm:px-6 md:ml-64">
      <div className="flex min-h-[114px] items-center gap-3 rounded-lg border border-[#806b36] bg-[#292929] px-3 py-5 sm:gap-4 sm:px-5">
        <Ticket
          className="h-12 w-12 shrink-0 text-[#e5ca7a] sm:h-14 sm:w-14"
          strokeWidth={1}
          aria-hidden="true"
        />

        <div className="min-w-0">
          <h2 className="text-base font-normal leading-tight text-[#e5ca7a] sm:text-lg">
            Boka din biobiljett
          </h2>

          <p className="text-xs text-[#999999]">
            Välj film, tid och salong. Snabbt &amp; enkelt.
          </p>

          <a
            href="/movies"
            className="mt-3 inline-flex h-6 items-center gap-2 rounded-full border border-[#806b36] bg-[#292929] px-4 text-sm leading-none text-[#e5ca7a] transition-colors hover:bg-[#e5ca7a] hover:text-[#1d1d1d]"
          >
            Boka nu
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}