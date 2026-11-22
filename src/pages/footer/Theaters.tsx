import { useEffect, useState } from "react";
import InfoPage from "../../components/InfoPage";

interface Theater {
  theaterId: number;
  name: string;
}

export default function Theaters() {
  const [theaters, setTheaters] = useState<Theater[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/theaters")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setTheaters)
      .catch(() => setError("Kunde inte hämta salonger."));
  }, []);

  return (
    <InfoPage title="Salonger" intro="Våra biosalonger.">
      {error && <p className="text-red-400">{error}</p>}
      <ul className="space-y-3">
        {theaters.map((t) => (
          <li key={t.theaterId} className="rounded-lg border border-[#806b36] bg-[#282828] p-4">
            {t.name}
          </li>
        ))}
      </ul>
    </InfoPage>
  );
}