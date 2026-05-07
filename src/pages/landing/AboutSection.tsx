import { motion } from "framer-motion";
import logo from "../../assets/logo.svg";
import "./AboutSection.css";

const STEPS = [
  {
    title: "Login",
    body: "Sign up with email or Google in seconds — no setup, no credit card, no team admin to chase.",
  },
  {
    title: "Log hours daily",
    body: "Drop in time-stamped entries as the day unfolds. Attach receipts and notes alongside the work.",
  },
  {
    title: "Get summary",
    body: "Weekly hours, streak, top projects, remote percentage — exportable as PDF or CSV when you need it.",
  },
];

export default function AboutSection() {
  return (
    <section id="about" className="about-section">
      <div className="about-grid">
        <motion.div
          className="about-mark"
          initial={{ opacity: 0, scale: 0.92 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <span className="about-mark-glow" aria-hidden />
          <img src={logo} alt="Workmark" />
        </motion.div>

        <div className="about-copy">
          <div className="about-eyebrow">About</div>
          <h2 className="about-title">
            Built for the way remote work actually feels.
          </h2>
          <p className="about-sub">
            We started Workmark because the tools we used to log remote work
            were either spreadsheets nobody opened or time-trackers that
            interrupted the work itself. Workmark is the small, calm record
            in between — fast to write, easy to share, quietly comprehensive
            when you look back.
          </p>

          <div className="about-pillars">
            {STEPS.map((p, i) => (
              <div key={p.title} className="about-pillar">
                <span className="about-pillar-num">0{i + 1}</span>
                <div>
                  <h3>{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
