import { useEffect, useRef, useState } from "react";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { Link as RouterLink } from "react-router-dom";
import { dashboardGlassCardSx } from "../../../styles/dashboard";
import { formatHoursDecimal } from "../../../utils/formatters";
import { HERO, brandPurpleAlpha } from "../../../styles/colors";

type VantaInstance = {
  destroy: () => void;
};

type DashboardHeroProps = {
  averagePerDay: number;
  firstName: string;
  peakDayLabel: string;
  recentEntriesLabel: string;
  recentLogCount: number;
  todayLabel: string;
};

export default function DashboardHero({
  averagePerDay,
  firstName,
  peakDayLabel,
  recentEntriesLabel,
  recentLogCount,
  todayLabel,
}: DashboardHeroProps) {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroVantaRef = useRef<VantaInstance | null>(null);
  // Without IntersectionObserver (SSR / very old browsers) treat the hero as
  // immediately visible; otherwise the observer flips this when it scrolls in.
  const [isVisible, setIsVisible] = useState(
    () => typeof IntersectionObserver === "undefined",
  );

  useEffect(() => {
    if (!heroRef.current) return;
    if (typeof IntersectionObserver === "undefined") return;
    const el = heroRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setIsVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let cancelled = false;

    async function initializeHeroBackground() {
      if (!heroRef.current || heroVantaRef.current) return;

      const p5Module = await import("p5");
      (window as Window & { p5?: unknown }).p5 = p5Module.default;

      const vantaModule = await import("vanta/dist/vanta.trunk.min");
      const createTrunkEffect = vantaModule.default as (options: Record<string, unknown>) => VantaInstance;

      if (cancelled || !heroRef.current) return;

      heroVantaRef.current = createTrunkEffect({
        el: heroRef.current,
        mouseControls: true,
        touchControls: true,
        gyroControls: false,
        minHeight: 200,
        minWidth: 200,
        scale: 1,
        scaleMobile: 1,
        color: 0x4e4598,
      });
    }

    void initializeHeroBackground();

    return () => {
      cancelled = true;
      heroVantaRef.current?.destroy();
      heroVantaRef.current = null;
    };
  }, [isVisible]);

  return (
    <Box
      sx={{
        position: "relative",
        mb: 3,
        "&::after": {
          content: '""',
          position: "absolute",
          left: "6%",
          right: "6%",
          bottom: -52,
          height: 124,
          borderRadius: "999px",
          background: `radial-gradient(circle, ${brandPurpleAlpha(0.22)} 0%, ${brandPurpleAlpha(0.12)} 42%, ${brandPurpleAlpha(0)} 80%)`,
          filter: "blur(30px)",
          pointerEvents: "none",
          zIndex: 0,
        },
      }}
    >
      <Paper
        ref={heroRef}
        variant="outlined"
        sx={{
          p: { xs: 2, md: 2.5 },
          ...dashboardGlassCardSx,
          position: "relative",
          overflow: "hidden",
          zIndex: 1,
          "& .vanta-canvas": {
            borderRadius: "inherit",
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            px: { xs: 0.5, sm: 1 },
            py: { xs: 0.5, sm: 0.75 },
          }}
        >
          <Stack
            direction="column"
            alignItems="center"
            justifyContent="center"
            spacing={{ xs: 1.5, md: 2 }}
            sx={{ textAlign: "center" }}
          >
            <Box sx={{ width: "100%", maxWidth: 720, mx: "auto" }}>
              <Chip
                label="Personal dashboard"
                size="small"
                sx={{
                  mb: 1.25,
                  bgcolor: HERO.chipBg,
                  color: HERO.chipText,
                  border: `1px solid ${HERO.chipBorder}`,
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2rem", md: "2.5rem" },
                  letterSpacing: "-0.04em",
                  color: HERO.title,
                  textShadow: `0 10px 30px ${HERO.titleShadow}`,
                }}
              >
                Welcome back, {firstName}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, color: HERO.subtitle }}>
                {todayLabel}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                justifyContent="center"
                sx={{ mt: 1 }}
              >
                <Chip
                  label={`${recentLogCount} ${recentEntriesLabel}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: HERO.statText,
                    borderColor: HERO.statBorder,
                    bgcolor: HERO.statBg,
                  }}
                />
                <Chip
                  label={`${formatHoursDecimal(averagePerDay)} hrs avg / day`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: HERO.statText,
                    borderColor: HERO.statBorder,
                    bgcolor: HERO.statBg,
                  }}
                />
                <Chip
                  label={`Peak day: ${peakDayLabel}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: HERO.statText,
                    borderColor: HERO.statBorder,
                    bgcolor: HERO.statBg,
                  }}
                />
              </Stack>
            </Box>

            <Box
              sx={{
                width: { xs: "100%", sm: "auto" },
                display: "flex",
                justifyContent: "center",
              }}
            >
              <Button
                component={RouterLink}
                to="/today"
                variant="contained"
                size="large"
                startIcon={<TrendingUpRounded />}
                sx={{
                  minWidth: { xs: "100%", sm: 190 },
                  maxWidth: { xs: 320, sm: "none" },
                  px: 3,
                  py: 1.45,
                }}
              >
                Log Today
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
