import type { CSSProperties } from "react";
import { SHINE_GRADIENT } from "../../styles/colors";
import "./ShineBorder.css";

// Plain-CSS port of Magic UI's <ShineBorder />. Renders an absolutely-positioned
// ring whose stroke is a conic gradient that rotates around the parent — the
// parent must be `position: relative; overflow: hidden`.
export interface ShineBorderProps {
  shineColor?: string | string[];
  duration?: number;     // seconds for one full rotation
  borderWidth?: number;  // px
  className?: string;
}

export default function ShineBorder({
  shineColor = SHINE_GRADIENT,
  duration = 14,
  borderWidth = 1,
  className = "",
}: ShineBorderProps) {
  const colors = Array.isArray(shineColor) ? shineColor.join(", ") : shineColor;

  const style: CSSProperties = {
    // Custom properties consumed by ShineBorder.css.
    ["--shine-colors" as string]: colors,
    ["--shine-duration" as string]: `${duration}s`,
    ["--shine-border-width" as string]: `${borderWidth}px`,
  };

  return <div aria-hidden className={`shine-border ${className}`.trim()} style={style} />;
}
