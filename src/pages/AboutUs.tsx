import { useState } from "react";
import { Link } from "react-router";
import { Clapperboard, ChevronDown, ChevronUp, Mail } from "lucide-react";

const faqCategories = [
  {
    title: "Tillgänglighet",
    answer:
      "Våra salonger har platser för rullstol. Kontakta oss i förväg så hjälper vi dig att ordna det.",
  },
  {
    title: "Åldersgränser",
    answer:
      "Filmens åldersgräns gäller. Vid 7-årsgräns får yngre barn följa med en vuxen. Ålder kan kontrolleras vid insläpp.",
  },
  {
    title: "Öppettider",
    answer:
      "Kassan öppnar en timme före dagens första visning. Se visningstiderna för respektive film.",
  },
  {
    title: "Biobiljetter",
    answer:
      "Vuxen 140 kr, pensionär 120 kr och barn 80 kr. Du kan avboka med e-postadress och bokningsnummer.",
  },
  {
    title: "Villkor & Policies",
    answer:
      "Läs mer om bokning, avbokning och hur vi hanterar personuppgifter under Villkor och Integritet.",
  },
  {
    title: "Jobba hos oss",
    answer:
      "Vi söker ibland nya medarbetare. Hör av dig via Kontakta oss så berättar vi mer.",
  },
];

export default function AboutUs() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div className="mx-auto w-full max-w-6xl py-6 text-[#e5ca7a]">
      {/* Sidrubrik */}
      <h1 className="mb-8 hidden text-center text-3xl font-normal md:block md:text-4xl">
        Om Filmvisarna
      </h1>

      {/* Logotyp endast mobil */}
      <div className="mb-6 flex flex-col items-center md:hidden">
        <img
          src="/images/Logo.png"
          alt="Filmvisarnas logga"
          className="mb-3 w-44 object-contain"
        />
        <div className="flex items-center gap-2 text-sm text-[#b99b4c]">
          <Clapperboard size={23} />
          <span>Om oss</span>
        </div>
      </div>

      {/* Informationskort */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section className="flex flex-col rounded-2xl border border-[#b99b4c] bg-[#1d1d1d] p-5 sm:p-6">
          <h2 className="mb-3 text-xl font-medium">
            Välkommen till vår biograf!
          </h2>

          <div className="space-y-3 text-sm leading-relaxed text-white">
            <p>
              Vår biograf är mer än bara en plats där vi visar film. Vi vill
              skapa en levande mötesplats fylld med film, gemenskap, event och
              upplevelser för alla.
            </p>

            <h3 className="text-base font-medium text-[#e5ca7a]">
              Vi brinner för film
            </h3>

            <p>
              Vi är passionerade filmvisare som älskar att dela filmupplevelser
              med andra. För oss handlar bio om mer än film på duken. Det
              handlar om stämningen, människorna och känslan av att uppleva
              något tillsammans.
            </p>

            <h3 className="text-base font-medium text-[#e5ca7a]">
              Event med speciella filmkvällar
            </h3>

            <p>
              Hos oss händer det mer än vanliga filmvisningar. Vi kommer
              regelbundet att erbjuda event och temakvällar för att göra
              biobesöket till något extra.
            </p>

            <p>
              Det kan till exempel vara filmpremiärer, maratonkvällar,
              temavisningar, familjedagar, filmquiz, samtal och andra
              aktiviteter. Håll gärna utkik efter våra kommande event!
            </p>
          </div>
        </section>

        {/* Företagsevent */}
        <section className="relative flex flex-col rounded-2xl border border-[#b99b4c] bg-[#1d1d1d] p-5 sm:p-6">
          <h2 className="mb-3 text-xl font-medium">
            Abonnera biografen eller boka ett företagsevent
          </h2>

          <div className="space-y-4 text-sm leading-relaxed text-white">
            <p>
              Vill du ha biografen för dig själv? Hos oss finns möjlighet att
              abonnera biografen för privata visningar, företagsevent och andra
              speciella tillfällen.
            </p>

            <p>
              Oavsett om du planerar en företagskväll, kundträff, presentation,
              födelsedag eller en privat filmvisning hjälper vi gärna till att
              skapa en upplevelse som passar just er.
            </p>

            <p>
              Kontakta oss med dina önskemål så berättar vi mer om
              möjligheterna och hjälper dig planera ditt event.
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

      {/* FAQ */}
      <section className="mt-8">
        <h2 className="mb-5 text-center text-2xl font-normal">
          Fler frågor och svar
        </h2>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-x-8">
          {faqCategories.map((faq, index) => (
            <div
              key={faq.title}
              className="self-start overflow-hidden rounded-lg bg-[#292929]"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                aria-expanded={openFaq === index}
                className="flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm text-white transition hover:text-[#e5ca7a]"
              >
                <span>{faq.title}</span>

                {openFaq === index ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {openFaq === index && (
                <div className="border-t border-[#806b36]/50 px-4 py-3 text-sm leading-relaxed text-gray-300">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Kontakt */}
      <div className="mt-8 flex justify-center pb-4">
        <Link
          to="/kontakt"
          className="inline-flex items-center gap-2 rounded-lg bg-[#e5ca7a] px-6 py-2 font-medium text-[#1d1d1d] transition hover:bg-[#b99b4c]"
        >
          <Mail size={18} />
          Kontakta oss
        </Link>
      </div>
    </div>
  );
}