import { useState } from "react";

export default function SnackPage() {
  const [snacks] = useState([
    { id: 1, name: "Popcorn liten", pris: 35 },
    { id: 2, name: "Popcorn mellan", pris: 47 },
    { id: 3, name: "Popcorn stor", pris: 59 },
    { id: 4, name: "Nachos", pris: 45 },
    { id: 5, name: "Gott & Blandat", pris: 30 },
    { id: 6, name: "Marabou mjölkchoklad", pris: 20 },
    { id: 7, name: "M&M's / Maltesers", pris: 35 },
  ]);

  const [drinks] = useState([
    { id: 6, name: "Läsk liten 33cl", pris: 25 },
    { id: 7, name: "Läsk mellan 50cl", pris: 35 },
    { id: 8, name: "Läsk stor 75cl", pris: 45 },
      { id: 9, name: "Festis", pris: 35 },
  ]);

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">
      <h1 className="text-3xl text-center font-bold mb-6">Snacks & Dryck</h1>
      
      {/* Huvudcontainer */}
      <div className="flex flex-col gap-8">
        
        {/* Snacks */}
        <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-md flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2 border-b-2 border-[#d4af37] pb-2">Snacks</h2>
          {snacks.map((item) => (
            <div key={item.id} className="flex justify-between items-center] pb-2">
              <span className="text-xl font-semibold">{item.name}</span>
              <span className="text-lg font-bold">{item.pris} kr</span>
            </div>
          ))}
        </div>

        {/* Dryck */}
        <div className="bg-[#2d2d2d] p-6 rounded-lg shadow-md flex flex-col gap-4">
          <h2 className="text-2xl font-bold mb-2 border-b-2 border-[#d4af37] pb-2">Dryck</h2>
          {drinks.map((item) => (
            <div key={item.id} className="flex justify-between items-center] pb-2">
                
              <span className="text-xl font-semibold">{item.name}</span>
              <span className="text-lg font-bold">{item.pris} kr</span>
             </div>
             
          ))}
        </div>
 
      </div>
    </div>
  );
}