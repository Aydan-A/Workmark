import { type CSSProperties, useEffect, useRef, useState } from "react";
import TextType from "../../components/reactbits/TextType";
// import logo from "../../assets/logo.svg";

type VantaInstance = {
  destroy: () => void;
};

export default function Hero() {
  const [menuOpen, setMenuOpen] = useState(false);
  const backgroundRef = useRef<HTMLDivElement | null>(null);
  const vantaRef = useRef<VantaInstance | null>(null);
  const closeMenu = () => setMenuOpen(false);

  useEffect(() => {
    if (!menuOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [menuOpen]);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    let cancelled = false;

    async function initializeBackground() {
      if (!backgroundRef.current || vantaRef.current) return;

      const p5Module = await import("p5");
      (window as Window & { p5?: unknown }).p5 = p5Module.default;

      const vantaModule = await import("vanta/dist/vanta.trunk.min");
      const createTrunkEffect = vantaModule.default as (options: Record<string, unknown>) => VantaInstance;

      if (cancelled || !backgroundRef.current) return;

      vantaRef.current = createTrunkEffect({
        el: backgroundRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color: 0x4e4598,
        backgroundColor: 0x05060f,
      });
    }

    void initializeBackground();

    return () => {
      cancelled = true;
      vantaRef.current?.destroy();
      vantaRef.current = null;
    };
  }, []);

  return (
    <header className="l-hero">
      <div ref={backgroundRef} className="l-hero-bg" aria-hidden />
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
          Daily work logs for remote teams.
          <span className="l-hero-type-line">
            <TextType
              text={[
                "Track hours without the ceremony.",
                "Turn each day into a weekly summary.",
                "Keep project work client-ready.",
              ]}
              typingSpeed={55}
              deletingSpeed={28}
              pauseDuration={2000}
            />
          </span>
        </h1>
        <p className="l-hero-sub">
          Workmark is a calm work log app for daily entries, project hours,
          receipt attachments, weekly summaries, and PDF or CSV exports.
        </p>
        <div className="l-hero-ctas">
          <a href="/login" className="l-btn l-btn-primary">Get started →</a>
        </div>

        <div className="l-hero-dashboard" aria-label="Workmark daily work flow preview">
          <div className="l-hero-dashboard-glow" aria-hidden />
          <div className="l-hero-dashboard-top">
            <span>Today</span>
            <span>Weekly summary</span>
            <span>Client ready</span>
          </div>
          <div className="l-hero-dashboard-grid">
            <div className="l-hero-log-card">
              <div className="l-hero-card-label">Log today</div>
              <div className="l-hero-input-row">
                <span className="l-hero-input-dot" />
                <span className="l-hero-input-text">Created Shopify product updates</span>
                <span className="l-hero-input-time">2h</span>
              </div>
              <div className="l-hero-entry-row delay-1">
                <span>Workmark app UI polish</span>
                <strong>1h</strong>
              </div>
              <div className="l-hero-entry-row delay-2">
                <span>Theme fixes and review</span>
                <strong>1h</strong>
              </div>
            </div>

            <div className="l-hero-summary-card">
              <div className="l-hero-card-label">This week</div>
              <div className="l-hero-metrics">
                <span><strong>8h</strong>Total hours</span>
                <span><strong>3</strong>Projects</span>
                <span><strong>1h 9m</strong>Avg / day</span>
              </div>
              <div className="l-hero-bars" aria-hidden>
                <span style={{ "--bar-width": "94%" } as CSSProperties} />
                <span style={{ "--bar-width": "46%" } as CSSProperties} />
                <span style={{ "--bar-width": "42%" } as CSSProperties} />
              </div>
            </div>

            <div className="l-hero-export-card">
              <div className="l-hero-card-label">Send proof</div>
              <button type="button">Copy text</button>
              <button type="button">Email client</button>
              <button type="button">Send PDF</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
