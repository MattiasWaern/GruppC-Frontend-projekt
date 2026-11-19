import React, { useState } from "react";

export default function ContactPage() {
  //Skickar kontaktformulär till backend
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (
    // Funktion för att uppdatera formulärdata när användaren skriver i input-fälten
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    // Funktion för att skicka formulärdata till backend när användaren skickar in formuläret
    e.preventDefault();

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitted(true);
      } else {
        console.error("Kunde inte skicka meddelandet");
      }
    } catch (error) {
      console.error("Nätverksfel:", error);
    }
  };

   return ( // Returnerar JSX för kontaktformuläret och kontaktinformationen
   <section className="mx-auto w-full max-w-7xl py-4 text-[#dedede] md:py-6">
      <h1 className="mb-5 text-center text-3xl font-bold text-[#e4ce83] md:mb-10 md:text-4xl">
        Kontakta oss
      </h1>

      {submitted ? ( // Om formuläret har skickats in, visa ett tackmeddelande
        <section className="mx-auto max-w-lg rounded-md border border-[#e4ce83] bg-[#2b2b2b] p-6 text-center">
          <h2 className="mb-2 text-xl font-semibold text-[#e4ce83]">
            Tack för ditt meddelande!
          </h2>
          <p className="text-sm">
            Vi svarar så fort vi kan, vanligtvis inom 24 timmar.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <section className="flex flex-col gap-6 rounded-md bg-[#2b2b2b] p-6 md:p-8 lg:p-10">
            <header>
              <h2 className="mb-3 break-words text-2xl font-semibold text-[#e4ce83] md:text-3xl">
                Filmvisarna HQ
              </h2>
              <p className="mb-3 text-base md:text-lg">
                Har du frågor om biljetter, tillgänglighet eller ditt
                medlemskap?
              </p>
              <p className="text-base md:text-lg">
                Fyll i formuläret eller hör av dig direkt till oss!
              </p>
              <img
                src="/images/FVKontaktIkon.png"
                alt="Filmvisarna kontaktikon"
                className="mx-auto mt-4 h-32 w-auto object-contain md:h-40"
              />
              {/* Bild */}
            </header>

            <address className="space-y-4 text-base not-italic md:text-lg">
              <p>
                <strong className="text-[#e4ce83]">E-post:</strong>{" "}
                <span className="break-all">filmvisarnagruppc@gmail.com</span>
              </p>
              <p>
                <strong className="text-[#e4ce83]">Telefon:</strong>{" "}
                <span className="whitespace-nowrap">08-123 456 78</span>
              </p>
              <p>
                <strong className="text-[#e4ce83]">Öppettider support:</strong>
                <br />
                Mån–Sön: 10:00 – 21:00
              </p>
            </address>
          </section>

          <form
            onSubmit={handleSubmit}
            className="space-y-5 rounded-md bg-[#2b2b2b] p-6 md:p-8 lg:p-10"
          >
            <section>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-semibold uppercase text-[#e4ce83]"
              >
                Namn
              </label>
              <input
                type="text"
                id="name"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded border border-[#3a3a3a] bg-[#181818] p-2 text-base text-[#dedede] focus:border-[#e4ce83] focus:outline-none"
              />
            </section>

            <section>
              <label
                htmlFor="email"
                className="mb-1 block text-sm font-semibold uppercase text-[#e4ce83]"
              >
                E-postadress
              </label>
              <input
                type="email"
                id="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded border border-[#3a3a3a] bg-[#181818] p-2 text-base text-[#dedede] focus:border-[#e4ce83] focus:outline-none"
              />
            </section>

            <section>
              <label
                htmlFor="subject"
                className="mb-1 block text-sm font-semibold uppercase text-[#e4ce83]"
              >
                Ämne
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                required
                value={formData.subject}
                onChange={handleChange}
                className="w-full rounded border border-[#3a3a3a] bg-[#181818] p-2 text-base text-[#dedede] focus:border-[#e4ce83] focus:outline-none"
              />
            </section>

            <section>
              <label
                htmlFor="message"
                className="mb-1 block text-sm font-semibold uppercase text-[#e4ce83]"
              >
                Meddelande
              </label>
              <textarea
                id="message"
                name="message"
                rows={5}
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full resize-none rounded border border-[#3a3a3a] bg-[#181818] p-2 text-base text-[#dedede] focus:border-[#e4ce83] focus:outline-none"
              ></textarea>
            </section>

            <button
              type="submit"
              className="block w-full rounded bg-[#d7b83e] px-4 py-3 text-lg font-bold text-[#181818] transition-colors hover:bg-[#e4ce83]"
            >
              Skicka meddelande
            </button>
          </form>
        </section>
      )}
    </section>
  );
}