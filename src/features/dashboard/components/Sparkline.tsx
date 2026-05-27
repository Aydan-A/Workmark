// Pure SVG sparklines — no extra deps.
import { BRAND_PURPLE } from "../../../styles/colors";

const PRIMARY = BRAND_PURPLE;

type SparklineLineProps = {
  data: number[];
  color?: string;
  height?: number;
};

export function SparklineLine({ data, color = PRIMARY, height = 40 }: SparklineLineProps) {
  if (data.length < 2) return null;

  const W = 100;
  const H = height;
  const pad = 3;
  const max = Math.max(...data, 0.01);

  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W;
    const y = H - pad - (v / max) * (H - pad * 2);
    return [x, y] as [number, number];
  });

  const polyline = pts.map(([x, y]) => `${x},${y}`).join(" ");
  const area =
    `M0,${H} L${pts.map(([x, y]) => `${x},${y}`).join(" L")} L${W},${H} Z`;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height }}
    >
      <path d={area} fill={color} opacity={0.1} />
      <polyline
        points={polyline}
        fill="none"
        stroke={color}
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.7}
      />
    </svg>
  );
}

type SparklineBarsProps = {
  data: number[];   // values 0–100
  color?: string;
  height?: number;
};

export function SparklineBars({ data, color = PRIMARY, height = 36 }: SparklineBarsProps) {
  if (!data.length) return null;

  const W = 100;
  const barW = (W / data.length) * 0.65;
  const gap = (W / data.length) * 0.35;

  return (
    <svg
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio="none"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height }}
    >
      {data.map((v, i) => {
        const barH = (v / 100) * height;
        const x = i * (W / data.length) + gap / 2;
        return (
          <rect
            key={i}
            x={x}
            y={height - barH}
            width={barW}
            height={Math.max(barH, v > 0 ? 2 : 0)}
            rx={2}
            fill={color}
            opacity={v === 0 ? 0.12 : 0.6}
          />
        );
      })}
    </svg>
  );
}

type SparklineDotsProps = {
  data: boolean[];
  color?: string;
};

export function SparklineDots({ data, color = PRIMARY }: SparklineDotsProps) {
  if (!data.length) return null;

  const r = 5;
  const gap = 4;
  const diameter = r * 2;
  const totalW = data.length * diameter + (data.length - 1) * gap;

  return (
    <svg
      viewBox={`0 0 ${totalW} ${diameter}`}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      style={{ display: "block", width: "100%", height: diameter + 2 }}
    >
      {data.map((logged, i) => (
        <circle
          key={i}
          cx={i * (diameter + gap) + r}
          cy={r}
          r={r - 1}
          fill={logged ? color : "none"}
          stroke={color}
          strokeWidth={logged ? 0 : 1.5}
          opacity={logged ? 0.8 : 0.22}
        />
      ))}
    </svg>
  );
}
