
import { useEffect, useState } from "react";
import { Cookie, Settings, X } from "lucide-react";

interface CookieConsent {
  necessary: true;
  analytics: boolean;
  savedAt: string;
}

const STORAGE_KEY = "filmvisarna-cookie-consent";

export default function CookieBanner() {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const savedConsent = localStorage.getItem(STORAGE_KEY);

    if (savedConsent) {
      try {
        const parsed = JSON.parse(savedConsent) as CookieConsent;

        if (
          parsed.necessary === true &&
          typeof parsed.analytics === "boolean"
        ) {
          setConsent(parsed);
          setAnalytics(parsed.analytics);
          return;
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }

    setShowBanner(true);
  }, []);

  function saveConsent(allowAnalytics: boolean) {
    const newConsent: CookieConsent = {
      necessary: true,
      analytics: allowAnalytics,
      savedAt: new Date().toISOString(),
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newConsent));

    setConsent(newConsent);
    setAnalytics(allowAnalytics);
    setShowBanner(false);
    setShowSettings(false);
  }

  return (
    <>
      {!showBanner && (
        <button
          type="button"
          onClick={() => {
            setAnalytics(consent?.analytics ?? false);
            setShowSettings(true);
            setShowBanner(true);
          }}
          className="fixed bottom-24 right-4 z-[60] rounded-full border border-[#806b36] bg-[#292929] p-3 text-[#e5ca7a] shadow-lg hover:bg-[#3a3a3a] md:bottom-5"
          aria-label="Ändra cookieinställningar"
          title="Cookieinställningar"
        >
          <Settings size={20} />
        </button>
      )}

      {showBanner && (
        <div className="fixed inset-x-0 bottom-[76px] z-[60] px-3 pb-3 md:bottom-4 md:px-4">
          <section
            aria-label="Cookieinställningar"
            className="mx-auto max-h-[75vh] max-w-3xl overflow-y-auto rounded-xl border border-[#806b36] bg-[#1d1d1d] p-5 text-white shadow-2xl"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Cookie className="text-[#e5ca7a]" size={24} />
                <h2 className="text-xl font-semibold text-[#e5ca7a]">
                  Vi använder cookies
                </h2>
              </div>

              {consent && (
                <button
                  type="button"
                  onClick={() => setShowBanner(false)}
                  aria-label="Stäng cookieinställningar"
                  className="text-gray-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            <p className="mb-5 text-sm leading-relaxed text-gray-300">
              Filmvisarna använder cookies för att webbplatsen
              ska fungera och för att förbättra din upplevelse.
              Här kan du läsa om vilka cookies vi använder och
              välja vilka du vill tillåta.
            </p>

            <div className="space-y-4">
              <div className="rounded-lg bg-[#292929] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium text-[#e5ca7a]">
                    Nödvändiga cookies
                  </h3>
                  <span className="text-xs text-green-400">
                    Alltid aktiva
                  </span>
                </div>

                <p className="mt-2 text-sm text-gray-300">
                  Behövs för webbplatsens grundläggande funktioner,
                  exempelvis inloggning och säkerhet. Dessa kan
                  inte väljas bort.
                </p>
              </div>

              <div className="rounded-lg bg-[#292929] p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-medium text-[#e5ca7a]">
                    Statistikcookies
                  </h3>

                  <input
                    type="checkbox"
                    checked={analytics}
                    onChange={(event) => setAnalytics(event.target.checked)}
                    className="h-5 w-5 accent-[#e5ca7a]"
                    aria-label="Tillåt statistikcookies"
                  />
                </div>

                <p className="mt-2 text-sm text-gray-300">
                  Kan användas för att förstå hur besökare använder
                  webbplatsen. Statistiken kan även ge underlag för
                  framtida marknadsföring.
                </p>

                <p className="mt-2 text-xs text-[#b99b4c]">
                  Statistikcookies är ännu inte aktiverade på Filmvisarna.
                </p>
              </div>
            </div>

            {showSettings && (
              <p className="mt-3 text-xs text-gray-400">
                Du kan ändra ditt val när som helst via
                cookieinställningarna.
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
              <button
                type="button"
                onClick={() => saveConsent(true)}
                className="rounded-lg bg-[#e5ca7a] px-4 py-3 text-sm font-semibold text-[#1d1d1d] transition hover:bg-[#b99b4c]"
              >
                Godkänn alla
              </button>

              <button
                type="button"
                onClick={() => saveConsent(false)}
                className="rounded-lg border border-[#e5ca7a] px-4 py-3 text-sm font-semibold text-[#e5ca7a] transition hover:bg-[#333333]"
              >
                Endast nödvändiga
              </button>

              {showSettings && (
                <button
                  type="button"
                  onClick={() => saveConsent(analytics)}
                  className="rounded-lg border border-[#806b36] px-4 py-3 text-sm text-white transition hover:bg-[#333333]"
                >
                  Spara mina val
                </button>
              )}

              {!showSettings && (
                <button
                  type="button"
                  onClick={() => setShowSettings(true)}
                  className="rounded-lg border border-[#806b36] px-4 py-3 text-sm text-white transition hover:bg-[#333333]"
                >
                  Anpassa inställningar
                </button>
              )}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
