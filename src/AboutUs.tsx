
import './AboutUs.css'

function AboutUs() {
  return (
    <main className="about-us">
      <section className="about-hero">
        <p className="about-eyebrow">FILMVISARNA AB</p>

        <h1>Mer än bara film.</h1>

        <p className="about-intro">
          Vi för människor samman genom filmens magi.
        </p>
      </section>

      <section className="about-content">
        <article className="about-section">
          <h2>Vår historia</h2>
          <p>
            På Filmvisarna AB tror vi att filmupplevelser blir
            ännu bättre när vi delar dem med andra. Vi vill skapa
            en välkomnande plats där människor kan koppla av från
            vardagen, upptäcka nya berättelser och skapa minnen
            tillsammans.
          </p>
        </article>

        <article className="about-section">
          <h2>Vårt uppdrag</h2>
          <p>
            Vårt mål är att göra varje biobesök till en fantastisk
            upplevelse. Från de senaste storfilmerna till tidlösa
            klassiker tycker vi att varje film förtjänar att
            upplevas på bioduken.
          </p>
        </article>

        <article className="about-section">
          <h2>Mer än bara film</h2>
          <p>
            Vi brinner för bra filmer, bekväma biografer och
            personlig service. Oavsett om du besöker oss med
            vänner, familj eller någon speciell vill vi att
            varje besök ska bli något att minnas.
          </p>
        </article>

        <article className="about-section">
          <h2>Vår vision</h2>
          <p>
            Vi vill föra människor närmare varandra genom
            berättelser som inspirerar, underhåller och berör.
            Vår vision är att skapa en biograf där alla känner
            sig välkomna och där filmens magi står i centrum.
          </p>
        </article>
      </section>
    </main>
  )
}

export default AboutUs
