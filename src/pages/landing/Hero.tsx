import { useEffect, useState } from "react";
import TextType from "../../components/reactbits/TextType";
// import logo from "../../assets/logo.svg";

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  return (
    <header className="l-hero">
      <div className="l-hero-bg" aria-hidden />
      <div className="l-hero-overlay" />

      <nav className={`l-nav ${menuOpen ? "is-open" : ""}`.trim()}>
        <div className="l-nav-logo">
          {/* <img src={logo} alt="Workmark" /> */}
          <span>Workmark</span>
        </div>

        <div className="l-nav-links">
          <a href="#features">Features</a>
          <a href="#about">About</a>
          <a href="#feedback">Feedback</a>
        </div>

        <div className="l-nav-actions">
          <a href="/login" className="l-nav-login">Log in</a>
          <a href="/login" className="l-nav-cta">Sign up</a>
        </div>

        <button
          type="button"
          className="l-nav-burger"
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="l-mobile-menu"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span /><span /><span />
        </button>
      </nav>

      <div
        id="l-mobile-menu"
        className={`l-mobile-menu ${menuOpen ? "is-open" : ""}`.trim()}
        onClick={closeMenu}
        aria-hidden={!menuOpen}
      >
        <div className="l-mobile-menu-panel" onClick={(e) => e.stopPropagation()}>
          <a href="#features" onClick={closeMenu}>Features</a>
          <a href="#about" onClick={closeMenu}>About</a>
          <a href="#feedback" onClick={closeMenu}>Feedback</a>
          <a href="/login" className="l-mobile-menu-login" onClick={closeMenu}>Log in</a>
          <a href="/login" className="l-btn l-btn-primary l-mobile-menu-cta" onClick={closeMenu}>
            Sign up →
          </a>
        </div>
      </div>

      <div className="l-hero-content">
        <span className="l-hero-eyebrow">For remote teams</span>
        <h1>
          <TextType
            text={[
              "A simple record of your remote work.",
              "Log it. Done.",
              "Built for remote teams.",
            ]}
            typingSpeed={55}
            deletingSpeed={28}
            pauseDuration={2000}
          />
        </h1>
        <p className="l-hero-sub">
          Workmark is the calmest way to capture what you did today —
          attachments, summaries, and PDF exports without the ceremony.
        </p>
        <div className="l-hero-ctas">
          <a href="/login" className="l-btn l-btn-primary">Get started →</a>
          <a href="#log-today" className="l-btn l-btn-ghost">See how it works</a>
        </div>
      </div>
    </header>
  );
}
