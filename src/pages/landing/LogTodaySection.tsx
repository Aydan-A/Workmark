import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import TextType from "../../components/reactbits/TextType";

const ENTRIES = [
  { time: "09:12", text: "Standup notes — sprint kickoff, blockers cleared." },
  { time: "10:40", text: "Drafted onboarding email copy with the design team." },
  { time: "13:05", text: "Reviewed PRs for the analytics module (#214, #218)." },
  { time: "15:30", text: "Pair session: refactored the auth context provider." },
];

const LIVE_PHRASES = [
  "Wrapping up — tomorrow: ship the export feature.",
  "Wrote the release notes and pushed them for review.",
  "Closed three tickets, drafted the weekly digest.",
];

export default function LogTodaySection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const entriesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [showLive, setShowLive] = useState(false);

  useEffect(() => {
    const node = sectionRef.current;
    if (!node) return;

    let tween: gsap.core.Tween | null = null;

    const playOnce = () => {
      const els = entriesRef.current.filter(Boolean) as HTMLDivElement[];
      gsap.set(els, { opacity: 0, y: 14 });
      setShowLive(false);
      tween = gsap.to(els, {
        opacity: 1,
        y: 0,
        duration: 0.55,
        ease: "power3.out",
        stagger: 0.28,
        onComplete: () => setShowLive(true),
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            playOnce();
          }
        });
      },
      { threshold: 0.35 }
    );
    io.observe(node);

    const loop = window.setInterval(() => {
      if (document.visibilityState === "visible") playOnce();
    }, 14000);

    return () => {
      io.disconnect();
      window.clearInterval(loop);
      tween?.kill();
    };
  }, []);

  return (
    <section ref={sectionRef} id="log-today" className="l-section">
      <div className="l-logtoday">
        <div>
          <div className="l-section-eyebrow">Log Today</div>
          <h2 className="l-section-title">Your day, captured as it happens.</h2>
          <p className="l-section-sub">
            Drop in entries the moment they matter — Workmark stitches them
            into a clean daily record you can share or export in seconds.
          </p>
        </div>

        <div className="l-mockup" aria-hidden>
          <div className="l-mockup-head">
            <span className="l-mockup-dot b" />
            <span className="l-mockup-dot" />
            <span className="l-mockup-dot" />
            <span className="l-mockup-title">Today · Tuesday</span>
          </div>
          {ENTRIES.map((e, i) => (
            <div
              key={i}
              ref={(el) => { entriesRef.current[i] = el; }}
              className="l-entry"
            >
              <span className="l-entry-time">{e.time}</span>
              <span className="l-entry-text">{e.text}</span>
            </div>
          ))}
          <div
            ref={(el) => { entriesRef.current[ENTRIES.length] = el; }}
            className="l-entry"
          >
            <span className="l-entry-time">17:42</span>
            <span className="l-entry-text">
              {showLive ? (
                <TextType
                  text={LIVE_PHRASES}
                  typingSpeed={45}
                  deletingSpeed={25}
                  pauseDuration={1600}
                />
              ) : (
                ""
              )}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
