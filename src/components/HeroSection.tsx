
export default function HeroSection() {
  return (
    <section className="hidden md:block md:ml-16 md:mt-5 md:mr-4 md:px-4">
      <div className="relative h-52 overflow-hidden rounded-sm sm:h-72 lg:h-96">
        <img
          src="/public/images/EventHero.png"
          alt="En exklusiv biograf"
          className="absolute inset-0 h-full w-full object-cover"
        />

        {/* Mörkt lager ovanpå bilden */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Text ovanpå bilden */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-end px-4 pb-8 text-center">
          <p className="mb-2 rounded-full border border-[#e5ca7a] bg-black px-3 py-1 text-xs font-semibold text-[#e5ca7a]">
            KOMMER SNART
          </p>

          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            Event hos Filmvisarna
          </h1>

          <p className="mt-2 text-sm text-white sm:text-base">
            Särskilda visningar och filmupplevelser är på väg.
          </p>
        </div>
      </div>
    </section>
  );
}
