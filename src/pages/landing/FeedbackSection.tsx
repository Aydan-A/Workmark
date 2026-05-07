import { useState } from "react";
import "./FeedbackSection.css";

const OWNER_EMAIL = "aydan26.abbasova@gmail.com";
const MESSAGE_LIMIT = 1000;

function buildMailto(name: string, message: string): string {
  const cleanName = name.trim();
  const subject = cleanName
    ? `Workmark feedback from ${cleanName}`
    : "Workmark feedback";
  const body = message.trim();
  return `mailto:${OWNER_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export default function FeedbackSection() {
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const canSend = message.trim().length > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSend) return;
    window.location.href = buildMailto(name, message);
  }

  return (
    <section id="feedback" className="feedback-section">
      <div className="feedback-wrap">
        <div className="feedback-eyebrow">Feedback</div>
        <h2 className="feedback-title">
          Got an idea or hit a rough edge? Send it my way.
        </h2>
        <p className="feedback-sub">I read every one.</p>

        <form className="feedback-form-card" onSubmit={handleSubmit}>
          <label className="feedback-label" htmlFor="feedback-name">
            Your name <span className="feedback-optional">(optional)</span>
          </label>
          <input
            id="feedback-name"
            className="feedback-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex"
            maxLength={60}
          />

          <label className="feedback-label" htmlFor="feedback-message">
            Your message
          </label>
          <textarea
            id="feedback-message"
            className="feedback-textarea"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe an issue, suggestion, or anything you'd like to see…"
            rows={5}
            maxLength={MESSAGE_LIMIT}
            required
          />

          <div className="feedback-row">
            <span className="feedback-counter">
              {message.length}/{MESSAGE_LIMIT}
            </span>
            <button
              type="submit"
              className="feedback-btn feedback-btn-primary"
              disabled={!canSend}
            >
              Send via email
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
