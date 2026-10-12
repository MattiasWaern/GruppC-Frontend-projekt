/// <reference types="vite/client" />
import '../AboutUs.css';

function AboutUs() {
  return (
    <main className="about-us">
      <section className="about-hero">
        <p className="about-eyebrow">V</p>

        <h1>Mer än bara film.</h1>

        <p className="about-intro">
          Vi för människor samman genom filmens magi.
        </p>
      </section>

      <section className="about-content">
        <article className="about-section">
          <h2>Vår historia</h2>
          <p>
            På Filmvisarna AB tror vi att filmupplevelser blir ännu bättre när vi delar dem med andra. Vi vill skapa en välkomnande plats där människor kan koppla av från vardagen, upptäcka nya berättelser och skapa minnen tillsammans.
          </p>
        </article>

        <article className="about-section">
          <h2>Vårt uppdrag</h2>
          <p>
            Vårt mål är att göra biobesöket till en fantastisk upplevelse för alla. Från de senaste storfilmerna till tidlösa klassiker – vi tycker att varje film förtjänar att upplevas på bioduken.
          </p>
        </article>

        <article className="about-section">
          <h2>Mer än bara film</h2>
          <p>
            Vi brinner för bra filmer, bekväma biografer och personlig service. Oavsett om du planerar en filmkväll med vänner, en familjeutflykt eller en mysig dejt vill vi att varje besök ska bli något att minnas.
          </p>
        </article>

        <article className="about-section">
          <h2>Vår vision</h2>
          <p>
            Vi vill föra människor närmare varandra genom berättelser som inspirerar, underhåller och berör. På Filmvisarna AB är vår vision att skapa en bioupplevelse där alla känner sig välkomna och där filmens magi står i centrum.
          </p>
        </article>
      </section>
    </main>
  )
}

export default AboutUs
