import { useEffect, useRef, useState } from "react";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import InsightsIcon from "@mui/icons-material/Insights";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { BRAND_PURPLE, brandPurpleAlpha } from "../../styles/colors";
import "./FeatureSection.css";

// Bento layout adapted from Magic UI's bento-grid pattern, ported to plain CSS
// so we don't need to add Tailwind. Each card takes a `background` node that
// renders behind the title strip — same trick the original uses.

type CardProps = {
  Icon: React.ComponentType<{ className?: string }>;
  name: string;
  description: string;
  href: string;
  cta: string;
  className?: string;
  background: React.ReactNode;
};

function BentoCard({ Icon, name, description, href, cta, className = "", background }: CardProps) {
  return (
    <div className={`bento-card ${className}`.trim()}>
      <div className="bento-card-bg">{background}</div>
      <div className="bento-card-content">
        <Icon className="bento-card-icon" />
        <h3 className="bento-card-title">{name}</h3>
        <p className="bento-card-desc">{description}</p>
      </div>
      <div className="bento-card-cta">
        <a href={href}>
          {cta} <ArrowForwardIcon style={{ fontSize: 14 }} />
        </a>
      </div>
      <div className="bento-card-hover" />
    </div>
  );
}

// --- Card 1: animated entries list (mirrors LogToday flow) -----------------

const ENTRIES = [
  { time: "09:12", text: "Standup — sprint kickoff, blockers cleared." },
  { time: "10:40", text: "Drafted onboarding email with the design team." },
  { time: "13:05", text: "Reviewed PRs for the analytics module." },
  { time: "15:30", text: "Pair session: refactored the auth provider." },
  { time: "17:42", text: "Wrote the release notes for tomorrow's ship." },
];

function AnimatedEntries() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    let i = 0;
    const tick = () => {
      i = (i + 1) % (ENTRIES.length + 2);
      setVisible(Math.min(i, ENTRIES.length));
    };
    const id = window.setInterval(tick, 1100);
    return () => window.clearInterval(id);
  }, []);

  return (
    <div className="bento-entries">
      {ENTRIES.slice(0, visible).map((e, i) => (
        <div key={`${e.time}-${i}`} className="bento-entry bento-entry-in">
          <span className="bento-entry-time">{e.time}</span>
          <span className="bento-entry-text">{e.text}</span>
        </div>
      ))}
    </div>
  );
}

// --- Card 2: mini calendar -------------------------------------------------

const CALENDAR_LOGGED = new Set([3, 4, 5, 6, 9, 10, 11, 12, 13, 17, 18, 19, 20]);
const TODAY = 20;

function MiniCalendar() {
  // First of "the month" lands on a Wednesday so the layout looks balanced.
  const blanks = 2;
  const days = Array.from({ length: 31 }, (_, i) => i + 1);
  const cells: (number | null)[] = [...Array(blanks).fill(null), ...days];

  return (
    <div className="bento-calendar">
      <div className="bento-calendar-head">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>
      <div className="bento-calendar-grid">
        {cells.map((d, i) => (
          <div
            key={i}
            className={[
              "bento-calendar-cell",
              d === null ? "is-blank" : "",
              d && CALENDAR_LOGGED.has(d) ? "is-logged" : "",
              d === TODAY ? "is-today" : "",
            ].filter(Boolean).join(" ")}
          >
            {d ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Card 3: receipts marquee ----------------------------------------------

const RECEIPTS = [
  { name: "uber-2024-03.pdf", body: "Client visit, Berlin → office. $42.10" },
  { name: "wework-march.pdf", body: "Coworking day pass — Friday standup." },
  { name: "lunch-team.jpg", body: "Team lunch with the design pod. $86.00" },
  { name: "monitor.pdf", body: "Home-office equipment reimbursement." },
  { name: "internet-q1.pdf", body: "Quarterly remote-work stipend, broadband." },
];

function ReceiptsMarquee() {
  const list = [...RECEIPTS, ...RECEIPTS];
  return (
    <div className="bento-marquee">
      <div className="bento-marquee-track">
        {list.map((r, i) => (
          <figure key={i} className="bento-receipt">
            <figcaption>{r.name}</figcaption>
            <blockquote>{r.body}</blockquote>
          </figure>
        ))}
      </div>
    </div>
  );
}

// --- Card 4: weekly stats --------------------------------------------------

const STATS = [
  { label: "Total hours", value: "37.5" },
  { label: "Streak", value: "12 days" },
  { label: "Remote", value: "82%" },
  { label: "Projects", value: "4" },
];

function WeeklyStatsPreview() {
  return (
    <div className="bento-stats">
      {STATS.map((s) => (
        <div key={s.label} className="bento-stat">
          <div className="bento-stat-value">{s.value}</div>
          <div className="bento-stat-label">{s.label}</div>
        </div>
      ))}
      <Sparkline />
    </div>
  );
}

function Sparkline() {
  // Simple weekly hours sparkline — purely decorative.
  const points = [3, 5.2, 4.1, 7.5, 6.8, 8.2, 2.7];
  const max = Math.max(...points);
  const w = 240;
  const h = 60;
  const step = w / (points.length - 1);
  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${i * step} ${h - (p / max) * h}`)
    .join(" ");

  return (
    <div className="bento-spark">
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={brandPurpleAlpha(0.35)} />
            <stop offset="100%" stopColor={brandPurpleAlpha(0)} />
          </linearGradient>
        </defs>
        <path d={`${path} L ${w} ${h} L 0 ${h} Z`} fill="url(#sparkFill)" />
        <path d={path} fill="none" stroke={BRAND_PURPLE} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

// --- Section ---------------------------------------------------------------

const FEATURES: CardProps[] = [
  {
    Icon: AccessTimeIcon,
    name: "Capture what you did",
    description: "Drop in time-stamped entries the moment they matter.",
    href: "/login",
    cta: "Start logging",
    className: "bento-span-2",
    background: <AnimatedEntries />,
  },
  {
    Icon: CalendarMonthIcon,
    name: "Track your month",
    description: "See logged days at a glance and drill in with one click.",
    href: "/login",
    cta: "See the calendar",
    className: "bento-span-1",
    background: <MiniCalendar />,
  },
  {
    Icon: ReceiptLongIcon,
    name: "Pin your receipts",
    description: "Attach receipts and files directly to any entry.",
    href: "/login",
    cta: "Try attachments",
    className: "bento-span-1",
    background: <ReceiptsMarquee />,
  },
  {
    Icon: InsightsIcon,
    name: "See the bigger picture",
    description: "Weekly hours, streak, remote percentage, and top projects.",
    href: "/login",
    cta: "Open the dashboard",
    className: "bento-span-2",
    background: <WeeklyStatsPreview />,
  },
];

export default function FeatureSection() {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <section ref={ref} id="features" className="bento-section">
      <div className="bento-head">
        <div className="bento-eyebrow">Features</div>
        <h2 className="bento-title">Everything Workmark actually does.</h2>
        <p className="bento-sub">
          No bloat, no roadmap promises — just the pieces already inside the app.
        </p>
      </div>

      <div className="bento-grid">
        {FEATURES.map((f) => (
          <div key={f.name} className={`bento-cell ${f.className ?? ""}`.trim()}>
            <BentoCard {...f} />
          </div>
        ))}
      </div>
    </section>
  );
}

