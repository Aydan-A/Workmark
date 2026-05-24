import { useEffect, useMemo, useRef, useState } from "react";

type Props = {
  text: string | string[];
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseDuration?: number;
  loop?: boolean;
  showCursor?: boolean;
  cursorChar?: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
};

export default function TextType({
  text,
  typingSpeed = 60,
  deletingSpeed = 35,
  pauseDuration = 1800,
  loop = true,
  showCursor = true,
  cursorChar = "|",
  className = "",
  as: Tag = "span",
}: Props) {
  // Key on text *content*, not array identity: callers often pass an inline
  // array literal (new ref each render), so memoizing on content keeps `phrases`
  // stable and the typing effect re-runs only when the text actually changes.
  const phrasesKey = Array.isArray(text) ? text.join("\u0000") : text;
  const phrases = useMemo(() => phrasesKey.split("\u0000"), [phrasesKey]);
  const [display, setDisplay] = useState("");
  const indexRef = useRef(0);
  const charRef = useRef(0);
  const deletingRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: number;

    const tick = () => {
      if (cancelled) return;
      const current = phrases[indexRef.current % phrases.length];
      if (!deletingRef.current) {
        charRef.current += 1;
        setDisplay(current.slice(0, charRef.current));
        if (charRef.current >= current.length) {
          if (!loop && indexRef.current === phrases.length - 1) return;
          timer = window.setTimeout(() => {
            deletingRef.current = true;
            tick();
          }, pauseDuration);
          return;
        }
        timer = window.setTimeout(tick, typingSpeed);
      } else {
        charRef.current -= 1;
        setDisplay(current.slice(0, Math.max(charRef.current, 0)));
        if (charRef.current <= 0) {
          deletingRef.current = false;
          indexRef.current += 1;
          timer = window.setTimeout(tick, 250);
          return;
        }
        timer = window.setTimeout(tick, deletingSpeed);
      }
    };
    tick();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [phrases, typingSpeed, deletingSpeed, pauseDuration, loop]);

  return (
    <Tag className={className}>
      {display}
      {showCursor && (
        <span aria-hidden className="text-type-cursor" style={{ marginLeft: 2 }}>
          {cursorChar}
        </span>
      )}
    </Tag>
  );
}
