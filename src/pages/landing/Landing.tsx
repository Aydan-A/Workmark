import Hero from "./Hero";
import FeatureSection from "./FeatureSection";
import AboutSection from "./AboutSection";
import FeedbackSection from "./FeedbackSection";
import "./Landing.css";

export default function Landing() {
  return (
    <div className="landing">
      <Hero />
      <FeatureSection />
      <AboutSection />
      <FeedbackSection />
      <footer className="l-footer">
        <div className="l-footer-inner">
          <div className="l-footer-brand">
            <div className="l-footer-logo">Workmark</div>
            <p>Simple daily work logs for remote teams.</p>
          </div>

          <nav className="l-footer-links" aria-label="Footer navigation">
            <a href="#features">Features</a>
            <a href="#about">About</a>
            <a href="#feedback">Feedback</a>
            <a href="/login">Log in</a>
          </nav>

          <div className="l-footer-action">
            <span>Start logging today</span>
            <a href="/login" className="l-footer-cta">Get started →</a>
          </div>
        </div>

        <div className="l-footer-bottom">
          <span>© 2026 Workmark</span>
        </div>
      </footer>
    </div>
  );
}
