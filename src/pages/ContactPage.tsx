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

  return (
    // Returnerar JSX för kontaktformuläret och kontaktinformationen
    <section className="max-w-4xl mx-auto px-4 py-12 text-[#dedede]">
      <h1 className="text-3xl font-bold text-[#e4ce83] mb-6 text-center">
        Kontakta oss
      </h1>

      {submitted ? (
        <section className="bg-[#2b2b2b] border border-[#e4ce83] p-6 rounded-md text-center max-w-lg mx-auto">
          <h2 className="text-xl font-semibold text-[#e4ce83] mb-2">
            Tack för ditt meddelande!
          </h2>
          <p className="text-sm">
            Vi svarar så fort vi kan, vanligtvis inom 24 timmar.
          </p>
        </section>
      ) : (
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <section className="bg-[#2b2b2b] p-6 rounded-md flex flex-col justify-between">
            <header>
              <h2 className="text-xl font-semibold text-[#e4ce83] mb-4">
                Filmvisarna HQ
              </h2>
              <p className="text-sm mb-4">
                Har du frågor om biljetter, biografer eller ditt medlemskap?
                Fyll i formuläret eller hör av dig direkt till oss!
              </p>
              <img
                src="/images/FVKontaktIkon.png"
                alt="Filmvisarna kontaktikon"
                className="my-4 h-40 w-40 object-contain mx-auto"
              />
              {/* Liten kontaktikon under introtexten.*/}
            </header>

            <address className="not-italic space-y-3 text-sm">
              <p>
                <strong className="text-[#e4ce83]">E-post:</strong>{" "}
                filmvisarnagruppc@gmail.com
              </p>
              <p>
                <strong className="text-[#e4ce83]">Telefon:</strong> 08-123 456
                78
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
            className="bg-[#2b2b2b] p-6 rounded-md space-y-4"
          >
            <section>
              <label
                htmlFor="name"
                className="block text-xs text-[#e4ce83] mb-1 uppercase font-semibold"
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
                className="w-full bg-[#181818] text-[#dedede] border border-[#3a3a3a] rounded p-2 focus:outline-none focus:border-[#e4ce83] text-sm"
              />
            </section>

            <section>
              <label
                htmlFor="email"
                className="block text-xs text-[#e4ce83] mb-1 uppercase font-semibold"
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
                className="w-full bg-[#181818] text-[#dedede] border border-[#3a3a3a] rounded p-2 focus:outline-none focus:border-[#e4ce83] text-sm"
              />
            </section>

            <section>
              <label
                htmlFor="subject"
                className="block text-xs text-[#e4ce83] mb-1 uppercase font-semibold"
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
                className="w-full bg-[#181818] text-[#dedede] border border-[#3a3a3a] rounded p-2 focus:outline-none focus:border-[#e4ce83] text-sm"
              />
            </section>

            <section>
              <label
                htmlFor="message"
                className="block text-xs text-[#e4ce83] mb-1 uppercase font-semibold"
              >
                Meddelande
              </label>
              <textarea
                id="message"
                name="message"
                rows={4}
                required
                value={formData.message}
                onChange={handleChange}
                className="w-full bg-[#181818] text-[#dedede] border border-[#3a3a3a] rounded p-2 focus:outline-none focus:border-[#e4ce83] text-sm resize-none"
              ></textarea>
            </section>

            <button
              type="submit"
              className="w-full bg-[#d7b83e] hover:bg-[#e4ce83] text-[#181818] font-bold py-2 px-4 rounded transition-colors"
            >
              Skicka meddelande
            </button>
          </form>
        </section>
      )}
    </section>
  );
}
