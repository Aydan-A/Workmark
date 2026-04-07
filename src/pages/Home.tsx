import { useEffect, useMemo, useRef, useState } from "react";
import {
  AccessTimeRounded,
  CalendarMonthRounded,
  NotesRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import PanelCard from "../components/common/PanelCard";
import StatCard from "../components/common/StatCard";
import {
  getEntryLoadErrorMessage,
  subscribeToEntries,
} from "../features/entries/entry.api";
import type { WorkEntry } from "../features/entries/entry.types";
import {
  buildRecentDashboardLogs,
  buildWeeklyOverview,
  getHoursForDate,
} from "../features/entries/entry.utils";
import { useAuth } from "../hooks/useAuth";

type VantaInstance = {
  destroy: () => void;
};

function formatHours(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

function getFirstName(name: string) {
  const trimmed = name.trim();

  if (!trimmed) return "Aydan";

  return trimmed.split(/\s+/)[0] || "Aydan";
}

export default function Home() {
  const theme = useTheme();
  const { user, loading: authLoading } = useAuth();
  const heroRef = useRef<HTMLDivElement | null>(null);
  const heroVantaRef = useRef<VantaInstance | null>(null);
  const [recentEntries, setRecentEntries] = useState<WorkEntry[]>([]);
  const [weeklyEntries, setWeeklyEntries] = useState<WorkEntry[]>([]);
  const [recentLoadError, setRecentLoadError] = useState<string | null>(null);
  const [weeklyLoadError, setWeeklyLoadError] = useState<string | null>(null);
  const [isRecentLoading, setIsRecentLoading] = useState(false);
  const [isWeeklyLoading, setIsWeeklyLoading] = useState(false);

  const now = new Date();
  const todayLabel = format(now, "EEEE, MMMM d");
  const todayKey = format(now, "yyyy-MM-dd");
  const referenceDate = useMemo(() => new Date(`${todayKey}T00:00:00`), [todayKey]);
  const weekStartKey = format(startOfWeek(referenceDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEndKey = format(endOfWeek(referenceDate, { weekStartsOn: 1 }), "yyyy-MM-dd");

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

  useEffect(() => {
    if (!user) {
      setRecentEntries([]);
      setRecentLoadError(null);
      setIsRecentLoading(false);
      return;
    }

    setIsRecentLoading(true);

    const unsubscribe = subscribeToEntries(
      (entries) => {
        setRecentEntries(entries);
        setRecentLoadError(null);
        setIsRecentLoading(false);
      },
      (error) => {
        setRecentLoadError(getEntryLoadErrorMessage(error));
        setIsRecentLoading(false);
      },
      { orderDirection: "desc", limitCount: 4 },
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) {
      setWeeklyEntries([]);
      setWeeklyLoadError(null);
      setIsWeeklyLoading(false);
      return;
    }

    setIsWeeklyLoading(true);

    const unsubscribe = subscribeToEntries(
      (entries) => {
        setWeeklyEntries(entries);
        setWeeklyLoadError(null);
        setIsWeeklyLoading(false);
      },
      (error) => {
        setWeeklyLoadError(getEntryLoadErrorMessage(error));
        setIsWeeklyLoading(false);
      },
      {
        startDate: weekStartKey,
        endDate: weekEndKey,
        orderDirection: "asc",
      },
    );

    return unsubscribe;
  }, [user, weekEndKey, weekStartKey]);

  const recentLogs = useMemo(
    () => buildRecentDashboardLogs(recentEntries, referenceDate),
    [recentEntries, referenceDate],
  );
  const weeklyOverview = useMemo(
    () => buildWeeklyOverview(weeklyEntries, referenceDate),
    [referenceDate, weeklyEntries],
  );

  const weeklyTotal = weeklyOverview.reduce((sum, day) => sum + day.hours, 0);
  const averagePerDay = weeklyTotal / weeklyOverview.length;
  const activeDays = weeklyOverview.filter((day) => day.hours > 0).length;
  const highestPoint = weeklyOverview.reduce(
    (best, item) => (item.hours > best.hours ? item : best),
    weeklyOverview[0],
  );
  const highestDay = Math.max(...weeklyOverview.map((day) => day.hours), 1);
  const displayName = user?.displayName?.trim() || "Aydan Abbasli";
  const firstName = getFirstName(displayName);
  const todayHours = getHoursForDate(weeklyEntries, todayKey);
  const dashboardErrors = [...new Set([recentLoadError, weeklyLoadError].filter((error): error is string => Boolean(error)))];
  const isDashboardLoading = authLoading || isRecentLoading || isWeeklyLoading;
  const recentEntriesLabel = recentLogs.length === 1 ? "recent log" : "recent logs";
  const activeDaysLabel = activeDays === 1 ? "active day" : "active days";
  const recentHelperText = !user
    ? "Sign in to view activity"
    : isDashboardLoading
      ? "Loading your latest entries"
      : recentLogs.length > 0
        ? "Latest saved work logs"
        : "No recent activity yet";

  const statCards = [
    {
      label: "Today's Hours",
      value: formatHours(todayHours),
      suffix: "hrs",
      helperText: !user
        ? "Sign in to start logging"
        : isDashboardLoading
          ? "Loading today's entry"
          : todayHours > 0
            ? "Entry logged for today"
            : "No entry logged yet",
      icon: <AccessTimeRounded fontSize="small" />,
    },
    {
      label: "This Week",
      value: formatHours(weeklyTotal),
      suffix: "hrs",
      helperText: !user
        ? "Sign in to view this week"
        : isDashboardLoading
          ? "Loading this week's hours"
          : `${activeDays} ${activeDaysLabel} this week`,
      icon: <CalendarMonthRounded fontSize="small" />,
    },
    {
      label: "Recent Entries",
      value: String(recentLogs.length),
      helperText: recentHelperText,
      icon: <NotesRounded fontSize="small" />,
    },
  ];

  return (
    <Box>
      <Paper
        ref={heroRef}
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 5,
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
          bgcolor: "transparent",
          "& .vanta-canvas": {
            borderRadius: "inherit",
          },
          mb: 3,
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
                  label={`${recentLogs.length} ${recentEntriesLabel}`}
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
                  label={`Peak day: ${highestPoint.day}`}
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

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          mb: 2.5,
        }}
      >
        {statCards.map((card, index) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            suffix={card.suffix}
            value={card.value}
            helperText={card.helperText}
            animationIndex={index}
          />
        ))}
      </Box>

      {dashboardErrors.map((error) => (
        <Alert key={error} severity="warning" sx={{ mb: 2.5 }}>
          {error}
        </Alert>
      ))}

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.08fr 0.92fr" },
          gap: 2,
          alignItems: "start",
          "& > *": { minWidth: 0 },
        }}
      >
        <PanelCard title="Recent Logs" subtitle="Your latest submitted work entries." actionLabel="View all" actionTo="/weekly">
          {recentLogs.length > 0 ? (
            <Stack spacing={1.5}>
              {recentLogs.map((log) => (
                <Box
                  key={log.id}
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "96px minmax(0, 1fr)" },
                    gap: 2,
                    p: 1.5,
                    borderRadius: 4,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.08),
                    bgcolor: alpha("#ffffff", 0.55),
                  }}
                >
                  <Box
                    sx={{
                      borderRadius: 3.5,
                      border: "1px solid",
                      borderColor: alpha(theme.palette.primary.main, 0.12),
                      bgcolor: alpha(theme.palette.primary.main, 0.08),
                      px: 2,
                      py: 1.75,
                      textAlign: { xs: "left", sm: "center" },
                    }}
                  >
                    <Typography variant="h3" sx={{ fontSize: "1.9rem", letterSpacing: "-0.04em" }}>
                      {formatHours(log.hours)}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                      hrs
                    </Typography>
                  </Box>

                  <Box sx={{ minWidth: 0 }}>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                      <Typography variant="h3" sx={{ fontSize: "1.2rem" }}>
                        {log.title}
                      </Typography>
                      <Chip
                        label={log.location}
                        size="small"
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.08),
                          color: "text.secondary",
                          fontWeight: 500,
                        }}
                      />
                    </Stack>
                    <Typography variant="body1" sx={{ mt: 0.8, color: "text.secondary", maxWidth: "56ch" }}>
                      {log.summary}
                    </Typography>
                    <Typography variant="subtitle2" sx={{ mt: 1.1, color: "#9aa0b5" }}>
                      {log.dateLabel}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Stack>
          ) : (
            <Box
              sx={{
                borderRadius: 4,
                border: "1px dashed",
                borderColor: alpha(theme.palette.primary.main, 0.14),
                px: 2.5,
                py: 4,
                textAlign: "center",
                color: "text.secondary",
              }}
            >
              <Typography variant="subtitle1">
                {isDashboardLoading ? "Loading your recent logs..." : "No work entries logged yet."}
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.75 }}>
                {user ? "Start with today's entry to populate this feed." : "Sign in to view your saved entries."}
              </Typography>
            </Box>
          )}
        </PanelCard>

        <PanelCard title="Weekly Overview" subtitle="Your hours across the current week." actionLabel="Calendar" actionTo="/calendar">
          <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ mb: 2 }}>
            <Chip label={`${formatHours(weeklyTotal)} hrs total`} variant="outlined" />
            <Chip label={`${activeDays} ${activeDaysLabel}`} variant="outlined" />
            <Chip label={`${highestPoint.day} peak`} variant="outlined" />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: { xs: 0.5, sm: 0.75, md: 1 },
              alignItems: "end",
              minHeight: { xs: 228, sm: 280 },
              p: { xs: 1, sm: 1.5 },
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.035),
              border: "1px solid rgba(112, 87, 246, 0.08)",
              overflow: "hidden",
            }}
          >
            {weeklyOverview.map((item) => {
              const ratio = item.hours / highestDay;
              const barHeight = item.hours === 0 ? "12%" : `${Math.max(ratio * 100, 28)}%`;

              return (
                <Box
                  key={item.day}
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: { xs: 0.5, sm: 0.75 },
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: item.hours > 0 ? "text.secondary" : "#b0b5c7",
                      fontSize: { xs: "0.65rem", sm: "0.75rem" },
                      textAlign: "center",
                      lineHeight: 1.1,
                      minHeight: { xs: 14, sm: 16 },
                    }}
                  >
                    {item.hours > 0 ? `${formatHours(item.hours)}h` : "-"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      width: "100%",
                      height: { xs: 144, sm: 184 },
                      borderRadius: 999,
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: barHeight,
                        borderRadius: "18px 18px 10px 10px",
                        bgcolor:
                          item.hours === 0
                            ? alpha(theme.palette.primary.main, 0.1)
                            : "primary.main",
                        backgroundImage:
                          item.hours === 0
                            ? "none"
                            : "linear-gradient(180deg, #8c79ff 0%, #7057f6 100%)",
                        boxShadow:
                          item.hours === 0
                            ? "none"
                            : "0 16px 32px rgba(112, 87, 246, 0.18)",
                      }}
                    />
                  </Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      color: "#8f96ad",
                      fontSize: { xs: "0.7rem", sm: "0.8125rem" },
                      lineHeight: 1.1,
                    }}
                  >
                    {item.day}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              mt: 1.75,
              pt: 1.5,
              px: { xs: 0.5, sm: 0.75 },
              pb: 0.25,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) auto" },
              alignItems: { xs: "start", sm: "end" },
              gap: { xs: 0.75, sm: 1.25 },
            }}
          >
            <Box
              sx={{
                minWidth: 0,
                maxWidth: { xs: "100%", sm: "28rem" },
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                textAlign: "left",
              }}
            >
              <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                Average per day
              </Typography>
              <Typography
                component="p"
                variant="body2"
                sx={{ display: "block", mt: 0.15, color: "text.secondary", maxWidth: { sm: "28rem" } }}
              >
                Based on your saved entries this week.
              </Typography>
            </Box>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "1.4rem", sm: "1.6rem", lg: "1.75rem" },
                letterSpacing: "-0.04em",
                whiteSpace: "nowrap",
                flexShrink: 0,
                maxWidth: "100%",
                justifySelf: { sm: "end" },
              }}
            >
              {formatHours(averagePerDay)} hrs
            </Typography>
          </Box>
        </PanelCard>
      </Box>
    </Box>
  );
}
