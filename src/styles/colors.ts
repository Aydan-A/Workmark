/**
 * Shared color constants. The MUI theme (theme.ts) is the source of truth for
 * semantic palette tokens; this file holds raw brand values and the project-color
 * swatch used outside the theme (e.g. deterministic per-project chips).
 */

/** Canonical brand purple. Matches theme `primary.main`. */
export const BRAND_PURPLE = "#7057f6";
/** RGB channels of {@link BRAND_PURPLE}, for building rgba() with custom alpha. */
export const BRAND_PURPLE_RGB = "112, 87, 246";

/** rgba() string for the brand purple at a given alpha. */
export function brandPurpleAlpha(alpha: number): string {
  return `rgba(${BRAND_PURPLE_RGB}, ${alpha})`;
}

/** Plain white. For raw SVG/canvas/library props that can't take an sx token. */
export const WHITE = "#ffffff";

/** RGB channels of the muted divider purple (matches theme `divider`). */
export const DIVIDER_PURPLE_RGB = "124, 106, 214";
/** rgba() string for the divider purple at a given alpha. */
export function dividerPurpleAlpha(alpha: number): string {
  return `rgba(${DIVIDER_PURPLE_RGB}, ${alpha})`;
}

/** White surface at a given alpha — for raw style props that can't take a glass token. */
export function whiteAlpha(alpha: number): string {
  return `rgba(255, 255, 255, ${alpha})`;
}

/**
 * Raw ink (text) values, mirroring theme.palette.ink. Use these only where an
 * sx token string ("text.primary" etc.) isn't possible — e.g. SVG fill/stroke,
 * FullCalendar event config, or other non-MUI style props.
 */
export const INK = {
  strong: "#111827",
  base: "#1f2340",
  muted: "#6f768f",
  faint: "#8b92ab",
  disabled: "#b8bcd0",
} as const;

/**
 * Raw neutral scale, mirroring theme.palette.grey. Use only where an sx token
 * ("grey.200") can't be resolved — e.g. nested-selector values in sx, or
 * third-party (FullCalendar) style strings.
 */
export const GREY = {
  50: "#f5f5f8",
  100: "#eef0f3",
  150: "#f3f4f6",
  200: "#d1d5db",
  300: "#b8bcd0",
  400: "#94a3b8",
  500: "#8b92ab",
  550: "#8f96ad",
  600: "#6d7394",
  650: "#475569",
  700: "#545c88",
  800: "#2f3360",
  900: "#111827",
} as const;

/** Swatch used to assign deterministic colors to projects without an explicit color. */
export const PROJECT_COLOR_PALETTE = [
  BRAND_PURPLE, "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4",
] as const;

/**
 * Decorative lavender-on-dark palette used only by the 3D DashboardHero.
 * Exact values preserved verbatim — these intentionally sit outside the main
 * theme since they only read correctly over the hero's dark animated backdrop.
 */
export const HERO = {
  chipBg: "rgba(140, 123, 255, 0.18)",
  chipText: "#d8d0ff",
  chipBorder: "rgba(170, 157, 255, 0.24)",
  title: "#f7f5ff",
  titleShadow: "rgba(0, 0, 0, 0.28)",
  subtitle: "rgba(234, 230, 255, 0.84)",
  statText: "#f3efff",
  statBorder: "rgba(220, 212, 255, 0.42)",
  statBg: "rgba(20, 24, 42, 0.18)",
} as const;

/**
 * Auth-screen palette (Login + Profile share it). A light surface with the
 * brand accent, plus dark-ink hairlines. Exact values preserved verbatim.
 */
export const AUTH = {
  bg: "#f7f8fb",
  card: "#ffffff",
  cardAlt: "#fafbfc",
  blue: BRAND_PURPLE,
  blueHover: "#4a4fe8",
  ink: "#0d0f1a",
  muted: "rgba(13, 15, 26, 0.6)",
  faint: "rgba(13, 15, 26, 0.45)",
  hairline: "rgba(13, 15, 26, 0.08)",
  hairlineStrong: "rgba(13, 15, 26, 0.16)",
  fieldBg: "rgba(13, 15, 26, 0.025)",
  fieldBgHover: "rgba(13, 15, 26, 0.06)",
  fieldBorderHover: "rgba(13, 15, 26, 0.10)",
  // Decorative glow accents on the auth/profile cards.
  glowPurple: "rgba(80, 70, 180, 0.22)",
  glowDark: "rgba(20, 22, 50, 0.18)",
  profileScrim: "rgba(31,35,64,0.52)",
} as const;

/** Chart/legend fallback colors, assigned in order when a project has no color. */
export const CHART_FALLBACK_PALETTE = ["#7057f6", "#43a047", "#fb8c00", "#0288d1"] as const;

/** Decorative shimmer gradient stops for the ShineBorder effect. */
export const SHINE_GRADIENT: string[] = ["#A07CFE", "#FE8FB5", "#FFBE7B"];

/** Deterministically map a project id to a palette color. */
export function projectColor(projectId: string): string {
  let h = 0;
  for (let i = 0; i < projectId.length; i++) {
    h = (Math.imul(31, h) + projectId.charCodeAt(i)) | 0;
  }
  return PROJECT_COLOR_PALETTE[Math.abs(h) % PROJECT_COLOR_PALETTE.length];
}
