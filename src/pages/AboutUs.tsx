import { useState } from "react";
import { Clapperboard, ChevronDown, ChevronUp, Mail } from "lucide-react";

const faqCategories = [
  "Tillgänglighet",
  "Åldersgränser",
  "På Biografen",
  "Öppettider",
  "Biobiljetter",
  "Villkor & Policies",
  "Jobba hos oss",
];


export default function AboutUs() {
  const [openFaq, setOpenFaq] = useState<number | null>(7);

  return (
    <div className="mx-auto w-full max-w-6xl py-6 text-[#e5ca7a]">

      {/* Sidrubrik */}
      <h1 className="mb-8 text-center text-3xl font normal md:text-4xl">
         <div className="mb-8 text-center text-3xl font- normal md:text-4xl">
            <span className="hidden md:inline">Om Filmvisarna</span>
        </div>
      </h1>
      {/* Logotyp endast mobil */}
      
      <div className="mb-6 flex flex-col items-center md:hidden">
        <img src="/public/images/Logo.png"
          alt="Filvisarnas logga"
          className=" mb-3 w-44 object-contain"
        />
        <div className="flex items-center gap-2 text-sm text-[#b99b4c]">
          <Clapperboard size={23} />
          <span>Om oss</span>
        </div>
      </div>

      {/* Informationskort */}

      <div className="grid grid-gols-1 gap-6 md:grid-cols-2">

        <section className="flex flex-col rounded-2xl border vorder-[#b99b4c] bg-[#1d1d1d] p-5 sm:p-6">
          <h2 className="mb-3 text-xl font-medium">
            Välkommen till vår biograf!
          </h2>

          <div className="space-y-3 text-sm leading-relaxed text-white">
            <p>
              Vår biograf är mer än bara en plats där vi visar fil.
              Vi vill skapa en levande mötesplats fylld med film,
              gemenskap, event och upplevelser för alla.
            </p>

            <h3 className="text-base font-medium text-[#e5ca7a]">
              Vi brinner för film
            </h3>

            <p>
              vi är passionerade filmvisare som älskar att dela
              filmupplevelser med andra. För oss handlar bio om mer
              än film på duken. Det handlar om stämningen,
              människorna och känslan av att uppleva något tillsammans.
            </p>

            <h3 className="text-base font-medium text-[#e5ca7a]">
              Event med speciella filmkvällar
            </h3>

            <p>
              Hos oss händer det mer än vanliga filmvisningar.
              Vi kommer regelbundet att erbjuda event och
              temakvällat för att göra biobesöket till något extra.
            </p>

            <p>
              Det kan till exempel vara filmpremiärer,
              maratonkvällar, temavisningar, familjedagar,
              filmquiz, samtal och andra aktiviteter.
              Håll gärna utkik efter våra kommande event!
            </p>
          </div>
        </section>

        {/*Företagsevent */}
        <section className="relative flex flex-col rounded-2xl border border-[#b99b4c] bg-[#1d1d1d] p-5 sm:p-6">
          <h2 className="mb-3 text-xl font-medium">
            Abonera biografen eller boka ett företagsevent
          </h2>

          <div className="space-y-4 text-sm leading-relaxed text-white">
            <p>
              Vill du ha biografen för dig själv? Hos oss finns
              möjlighet att abonnera biografen för priviata visningar,
              företagsevent och andra speciella tillfällen.
            </p>

            <p>
              Oavsett om du planerar en företagskväll,
              kundträff, presentation, födelsedag eller en
              privat filmvisning hjälper vi gärna till att skapa
              en upplevelse som passar just er. 
            </p>

            <p>
              Kontakta oss med dina önskemål så berättar vi mer
              om möjligheterna och hjälper sig planera ditt event.
            </p>
          </div>

          <div className="mt-auto flex justify-end pt-6">
            <Clapperboard
              size={42}
              strokeWidth={1.3}
              className="text-[#e5ca7a]"
            />
          </div>
        </section>
      </div>

      {/*FAQ*/}
      <section className="mt-8">
        <h2 className="mb-5 text.center text-2xl font-normal">
          Fler frågor och svar
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-8">
          {faqCategories.map((category, index) => (
            <div
              key={category}
              className="self-start overflow-hidden rounded-lg bg-[#292929]"
            >
              <button
                type="button"
                onClick={() =>
                  setOpenFaq(openFaq === index ? null : index)
                }
                aria-expanded={openFaq === index}
                className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-white transition hover:text-[#e5ca7a]"
              >
                <span>{category}</span>

                {openFaq === index ? (
                  <ChevronUp size={18}/>
                ) : (
                    <ChevronDown size={18} />
                )}
              </button>

              {openFaq === index && (
                <div className="border-t border-[#806b36]/50 px-4 py-3 text-sm leading-relaxed text-gray-300">
                  Här kommer information och svar på frågor
                  inom kategorin {category.toLowerCase()}.
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Kontakt */}
      <div className="mt-8 flex justify-center pb-4">
        <a
          href="mailto:"
          className="inline-flex items-center gap-2 rounded-lg bg-[#e5ca7a] px-6 py-2 font-medium text-[#1d1d1d] transition hover:bg-[#b99b4c]"
        >
          <Mail size={18} />
          Kontakta oss
        </a>
      </div>

    </div>
  );
}
