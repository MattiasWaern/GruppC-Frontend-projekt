import InfoPage from "../../components/InfoPage";

export default function Terms() {
  return (
    <InfoPage title="Villkor" intro="Villkor för bokning och besök hos Filmvisarna.">
      <h2 className="text-xl font-semibold text-[#e5ca7a]">Bokning</h2>
      <p>Platser reserveras i 10 minuter medan du slutför bokningen. Efter det släpps de till andra besökare.</p>
      <h2 className="text-xl font-semibold text-[#e5ca7a]">Avbokning</h2>
      <p>Du kan avboka med din e-postadress och ditt bokningsnummer, innan visningen har börjat.</p>
      <h2 className="text-xl font-semibold text-[#e5ca7a]">Åldersgränser</h2>
      <p>Filmens åldersgräns gäller. Ålder kan kontrolleras vid insläpp.</p>
    </InfoPage>
  );
}