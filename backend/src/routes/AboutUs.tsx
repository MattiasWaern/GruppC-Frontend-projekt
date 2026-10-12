import '../AboutUs.css';

function AboutUs() {
  return (
    <main className="about-us">
      <section className="about-hero">
        <p className="about-eyebrow">WELCOME TO SILVER SCREEN CINEMAS</p>

        <h1>More than movies.</h1>

        <p className="about-intro">
          Bringing people together through the magic of cinema.
        </p>
      </section>

      <section className="about-content">
        <article className="about-section">
          <h2>Our Story</h2>
          <p>
            We believe movies are better when we experience them together.
            Our cinema is a place to escape everyday life, discover new
            stories, and share unforgettable moments.
          </p>
        </article>

        <article className="about-section">
          <h2>Our Mission</h2>
          <p>
            Our mission is to make going to the cinema enjoyable for
            everyone, from the latest blockbusters to timeless classics.
          </p>
        </article>

        <article className="about-section">
          <h2>More Than Movies</h2>
          <p>
            We care about great films, comfortable surroundings, and
            excellent customer service. Every visit should feel memorable.
          </p>
        </article>

        <article className="about-section">
          <h2>Our Vision</h2>
          <p>
            We want to connect people through stories that inspire,
            entertain, and bring us closer together.
          </p>
        </article>
      </section>
    </main>
  )
}

export default AboutUs
