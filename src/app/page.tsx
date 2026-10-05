import Link from "next/link";

const curiosityCards = [
  {
    category: "THE SCIENCE OF LEARNING",
    title: "Why does explaining an idea help you remember it?",
    description: "A two-minute read on the Feynman technique and the power of teaching back.",
    image: "/learning-notes.jpg",
    imageAlt: "Open notebook and coffee on a wooden desk",
    href: "/chat",
    action: "Explore the idea",
  },
  {
    category: "ARTIFICIAL INTELLIGENCE",
    title: "How can a machine learn from examples?",
    description: "Meet the patterns, predictions, and surprisingly human intuition behind AI.",
    image: "/ai-learning.jpg",
    imageAlt: "Abstract visualization of an artificial intelligence network",
    href: "/chat",
    action: "Ask your AI tutor",
  },
  {
    category: "CREATIVE THINKING",
    title: "What happens when you give an idea room to grow?",
    description: "Try a small prompt that turns a blank page into a starting point.",
    image: "/creative-workspace.jpg",
    imageAlt: "Hand writing a note in a notebook beside a plant",
    href: "/login",
    action: "Start a learning session",
  },
];

export default function HomePage() {
  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> A calmer way to make progress</p>
          <h1>Curiosity is a skill.<br /><em>Keep it growing.</em></h1>
          <p className="home-hero-description">
            A learning space built around your questions. Explore new ideas, practice what matters, and get thoughtful help along the way.
          </p>
          <div className="home-hero-actions">
            <Link href="/login" className="button-primary">Start learning <span aria-hidden="true">→</span></Link>
            <Link href="#curiosity" className="button-text">Find something curious <span aria-hidden="true">↓</span></Link>
          </div>
          <div className="home-proof">
            <span className="proof-mark" aria-hidden="true">✳</span>
            <span>Small steps. Clear thinking. Real progress.</span>
          </div>
        </div>

        <div className="home-hero-visual">
          <div
            className="home-hero-image"
            role="img"
            aria-label="A group of people learning together around a table"
            style={{
              backgroundImage: "url(https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1400&q=80)",
            }}
          />
          <div className="home-image-note">
            <span className="image-note-label">THE LEARNING LOOP</span>
            <span>Explore an idea. Practice it. Make it yours.</span>
            <Link href="/dashboard" className="image-note-link">See how it works <span aria-hidden="true">↗</span></Link>
          </div>
          <div className="home-image-index">GUIDED LEARNING <span>/</span> YOUR PACE</div>
        </div>
      </section>

      <section id="curiosity" className="curiosity-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">A good place to begin</p>
            <h2>Follow a question.</h2>
          </div>
          <p className="section-intro">The best learning often starts with a small “why?” Pick a thread and see where it leads.</p>
        </div>

        <div className="curiosity-grid">
          {curiosityCards.map((card, index) => (
            <article className="curiosity-card" key={card.title}>
              <div
                className="curiosity-image"
                role="img"
                aria-label={card.imageAlt}
                style={{ backgroundImage: `url(${card.image})` }}
              >
                <span className="curiosity-number">0{index + 1}</span>
              </div>
              <div className="curiosity-content">
                <p className="curiosity-category">{card.category}</p>
                <h3>{card.title}</h3>
                <p className="curiosity-description">{card.description}</p>
                <Link href={card.href} className="curiosity-link">{card.action} <span aria-hidden="true">↗</span></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="learning-note">
        <div className="learning-note-inner">
          <span className="note-symbol" aria-hidden="true">✳</span>
          <div>
            <p className="eyebrow">Made for your momentum</p>
            <h2>Learn at your pace.<br />Get help when you need it.</h2>
          </div>
          <p className="learning-note-copy">Build a path that fits you with guided modules, quick practice, and an AI tutor ready to work through the tricky parts.</p>
          <Link href="/dashboard" className="button-light">Explore your dashboard <span aria-hidden="true">→</span></Link>
        </div>
      </section>
    </main>
  );
}