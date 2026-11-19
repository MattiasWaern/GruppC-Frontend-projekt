
const snacks = [
  { id: 1, name: "Popcorn liten", pris: 35 },
  { id: 2, name: "Popcorn mellan", pris: 47 },
  { id: 3, name: "Popcorn stor", pris: 59 },
  { id: 4, name: "Nachos", pris: 45 },
  { id: 5, name: "Gott & Blandat", pris: 30 },
  { id: 6, name: "Marabou mjölkchoklad", pris: 20 },
  { id: 7, name: "M&M's / Maltesers", pris: 35 },
];

const drinks = [
  { id: 1, name: "Läsk liten 33cl", pris: 25 },
  { id: 2, name: "Läsk mellan 50cl", pris: 35 },
  { id: 3, name: "Läsk stor 75cl", pris: 45 },
  { id: 4, name: "Festis", pris: 35 },
];

const menus = [
  { id: 1, name: "Liten meny", innehall: "Popcorn liten + Läsk liten 33cl", pris: 55 },
  { id: 2, name: "Mellanmeny", innehall: "Popcorn mellan + Läsk mellan 50cl", pris: 75 },
  { id: 3, name: "Stor meny", innehall: "Popcorn stor + Läsk stor 75cl", pris: 95 },
];

export default function SnackPage() {
  return (
    <div className="container mx-auto px-4 py-10 max-w-3xl">
      <h1 className="text-3xl text-center font-bold mb-8">Snacks & Dryck</h1>

      {/* relative = bilden positioneras i förhållande till den här rutan */}
      <div className="relative">

        {/* Bild: ovanför menyn på små skärmar, till höger om menyn på stora */}
        <div className="mb-8 2xl:mb-0 2xl:absolute 2xl:left-full 2xl:top-0 2xl:h-full 2xl:ml-8 2xl:w-56">
          <img
            src="/images/snax.png"
            alt="Läsk, popcorn och biobiljetter"
            className="mx-auto w-40 2xl:w-56 2xl:sticky 2xl:top-24 2xl:mt-72"
          />
        </div>

        {/* Innehållet, alltid centrerat */}
        <div className="flex flex-col gap-8">

          {/* Menyer */}
          <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#d4af37] pb-2">
              Menyer
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {menus.map((menu) => (
                <div
                  key={menu.id}
                  className="border border-[#d4af37] rounded-lg p-4 text-center"
                >
                  <h3 className="text-xl font-bold text-[#d4af37]">{menu.name}</h3>
                  <p className="text-sm my-2">{menu.innehall}</p>
                  <p className="text-lg font-bold">{menu.pris} kr</p>
                </div>
              ))}
            </div>
          </div>

          {/* Snacks */}
          <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-md flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2 border-b-2 border-[#d4af37] pb-2">
              Snacks
            </h2>
            {snacks.map((item) => (
              <div key={item.id} className="flex justify-between items-center pb-2">
                <span className="text-xl font-semibold">{item.name}</span>
                <span className="text-lg font-bold">{item.pris} kr</span>
              </div>
            ))}
          </div>

          {/* Dryck */}
          <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-md flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-2 border-b-2 border-[#d4af37] pb-2">
              Dryck
            </h2>
            {drinks.map((item) => (
              <div key={item.id} className="flex justify-between items-center pb-2">
                <span className="text-xl font-semibold">{item.name}</span>
                <span className="text-lg font-bold">{item.pris} kr</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}