import { useEffect, useRef } from "react";
import { TrendingUpRounded } from "@mui/icons-material";
import { Box, Button, Chip, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import { dashboardGlassCardSx } from "../../../styles/dashboard";
import { formatHours } from "../../../utils/formatters";

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

  useEffect(() => {
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
  }, []);

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
          background:
            "radial-gradient(circle, rgba(112, 87, 246, 0.22) 0%, rgba(112, 87, 246, 0.12) 42%, rgba(112, 87, 246, 0) 80%)",
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
          p: { xs: 2.5, md: 3.5 },
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
            spacing={{ xs: 2.5, md: 3 }}
            sx={{ textAlign: "center" }}
          >
            <Box sx={{ width: "100%", maxWidth: 720, mx: "auto" }}>
              <Chip
                label="Personal dashboard"
                size="small"
                sx={{
                  mb: 1.25,
                  bgcolor: "rgba(140, 123, 255, 0.18)",
                  color: "#d8d0ff",
                  border: "1px solid rgba(170, 157, 255, 0.24)",
                }}
              />
              <Typography
                variant="h1"
                sx={{
                  fontSize: { xs: "2.1rem", md: "2.7rem" },
                  letterSpacing: "-0.04em",
                  color: "#f7f5ff",
                  textShadow: "0 10px 30px rgba(0, 0, 0, 0.28)",
                }}
              >
                Welcome back, {firstName}
              </Typography>
              <Typography variant="subtitle1" sx={{ mt: 1, color: "rgba(234, 230, 255, 0.84)" }}>
                {todayLabel}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                flexWrap="wrap"
                useFlexGap
                justifyContent="center"
                sx={{ mt: 2 }}
              >
                <Chip
                  label={`${recentLogCount} ${recentEntriesLabel}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: "#f3efff",
                    borderColor: "rgba(220, 212, 255, 0.42)",
                    bgcolor: "rgba(20, 24, 42, 0.18)",
                  }}
                />
                <Chip
                  label={`${formatHours(averagePerDay)} hrs avg / day`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: "#f3efff",
                    borderColor: "rgba(220, 212, 255, 0.42)",
                    bgcolor: "rgba(20, 24, 42, 0.18)",
                  }}
                />
                <Chip
                  label={`Peak day: ${peakDayLabel}`}
                  size="small"
                  variant="outlined"
                  sx={{
                    color: "#f3efff",
                    borderColor: "rgba(220, 212, 255, 0.42)",
                    bgcolor: "rgba(20, 24, 42, 0.18)",
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
