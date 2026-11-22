import { useEffect, useState } from "react";
import InfoPage from "../../components/InfoPage";

interface TicketType {
  ticketTypeId: number;
  name: string;
  price: number;
}

export default function Tickets() {
  const [tickets, setTickets] = useState<TicketType[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/tickets")
      .then((res) => {
        if (!res.ok) throw new Error();
        return res.json();
      })
      .then(setTickets)
      .catch(() => setError("Kunde inte hämta biljettpriser."));
  }, []);

  return (
    <InfoPage title="Biljetter" intro="Våra biljettyper och priser.">
      {error && <p className="text-red-400">{error}</p>}
      <ul className="space-y-3">
        {tickets.map((t) => (
          <li key={t.ticketTypeId} className="flex justify-between rounded-lg border border-[#806b36] bg-[#282828] p-4">
            <span>{t.name}</span>
            <span className="font-semibold text-[#e5ca7a]">{t.price} kr</span>
          </li>
        ))}
      </ul>
    </InfoPage>
  );
}