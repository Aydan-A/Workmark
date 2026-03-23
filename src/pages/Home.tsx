import {
  AccessTimeRounded,
  CalendarMonthRounded,
  NotesRounded,
  TrendingUpRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { format } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import PanelCard from "../components/common/PanelCard";
import StatCard from "../components/common/StatCard";
import { dashboardMockData } from "../features/dashboard/mockData";
import { useAuth } from "../hooks/useAuth";

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
  const { user } = useAuth();
  const todayLabel = format(new Date(), "EEEE, MMMM d");
  const weeklyTotal = dashboardMockData.weeklyOverview.reduce((sum, day) => sum + day.hours, 0);
  const averagePerDay = weeklyTotal / dashboardMockData.weeklyOverview.length;
  const activeDays = dashboardMockData.weeklyOverview.filter((day) => day.hours > 0).length;
  const highestPoint = dashboardMockData.weeklyOverview.reduce(
    (best, item) => (item.hours > best.hours ? item : best),
    dashboardMockData.weeklyOverview[0],
  );
  const highestDay = Math.max(...dashboardMockData.weeklyOverview.map((day) => day.hours), 1);
  const displayName = user?.displayName?.trim() || "Aydan Abbasli";
  const firstName = getFirstName(displayName);

  const statCards = [
    {
      label: "Today's Hours",
      value: "0",
      suffix: "hrs",
      helperText: "No entry logged yet",
      icon: <AccessTimeRounded fontSize="small" />,
    },
    {
      label: "This Week",
      value: formatHours(weeklyTotal),
      suffix: "hrs",
      helperText: `${activeDays} active days this week`,
      icon: <CalendarMonthRounded fontSize="small" />,
    },
    {
      label: "Total Entries",
      value: String(dashboardMockData.recentLogs.length),
      helperText: "Recent activity snapshot",
      icon: <NotesRounded fontSize="small" />,
    },
  ];

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 5,
          borderColor: "divider",
          backgroundImage:
            "radial-gradient(circle at top right, rgba(112,87,246,0.14), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.98) 100%)",
          mb: 3,
        }}
      >
        <Stack
          direction={{ xs: "column", md: "row" }}
          alignItems="center"
          justifyContent="space-between"
          spacing={3}
        >
          <Box sx={{ flex: 1, textAlign: "center" }}>
            <Chip
              label="Personal dashboard"
              size="small"
              sx={{
                mb: 1.25,
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: "primary.main",
                border: "1px solid rgba(112,87,246,0.1)",
              }}
            />
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: "2.1rem", md: "2.7rem" },
                letterSpacing: "-0.04em",
              }}
            >
              Welcome back, {firstName}
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, color: "text.secondary" }}>
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
              <Chip label={`${dashboardMockData.recentLogs.length} recent logs`} size="small" variant="outlined" />
              <Chip label={`${formatHours(averagePerDay)} hrs avg / day`} size="small" variant="outlined" />
              <Chip label={`Peak day: ${highestPoint.day}`} size="small" variant="outlined" />
            </Stack>
          </Box>

          <Box sx={{ width: { xs: "100%", md: "auto" } }}>
            <Button
              component={RouterLink}
              to="/today"
              variant="contained"
              size="large"
              startIcon={<TrendingUpRounded />}
              sx={{ minWidth: { xs: "100%", sm: 190 }, px: 3, py: 1.45 }}
            >
              Log Today
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
          mb: 2.5,
        }}
      >
        {statCards.map((card) => (
          <StatCard
            key={card.label}
            icon={card.icon}
            label={card.label}
            suffix={card.suffix}
            value={card.value}
            helperText={card.helperText}
          />
        ))}
      </Box>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.08fr 0.92fr" },
          gap: 2,
          alignItems: "start",
        }}
      >
        <PanelCard title="Recent Logs" subtitle="Your latest submitted work entries." actionLabel="View all" actionTo="/weekly">
          <Stack spacing={1.5}>
            {dashboardMockData.recentLogs.map((log) => (
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
        </PanelCard>

        <PanelCard title="Weekly Overview" subtitle="Your hours across the current week." actionLabel="Calendar" actionTo="/calendar">
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap sx={{ mb: 2.5 }}>
            <Chip label={`${formatHours(weeklyTotal)} hrs total`} variant="outlined" />
            <Chip label={`${activeDays} active days`} variant="outlined" />
            <Chip label={`${highestPoint.day} peak`} variant="outlined" />
          </Stack>

          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: { xs: 1, md: 1.5 },
              alignItems: "end",
              minHeight: 296,
              p: 2,
              borderRadius: 4,
              bgcolor: alpha(theme.palette.primary.main, 0.035),
              border: "1px solid rgba(112, 87, 246, 0.08)",
            }}
          >
            {dashboardMockData.weeklyOverview.map((item) => {
              const ratio = item.hours / highestDay;
              const barHeight = item.hours === 0 ? "12%" : `${Math.max(ratio * 100, 28)}%`;

              return (
                <Box key={item.day} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.1 }}>
                  <Typography variant="caption" sx={{ color: item.hours > 0 ? "text.secondary" : "#b0b5c7" }}>
                    {item.hours > 0 ? `${formatHours(item.hours)}h` : "-"}
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "flex-end",
                      width: "100%",
                      height: 200,
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
                  <Typography variant="subtitle2" sx={{ color: "#8f96ad" }}>
                    {item.day}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              mt: 2.5,
              pt: 2.25,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Box>
              <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
                Average per day
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.35, color: "text.secondary" }}>
                Based on the current visible week.
              </Typography>
            </Box>
            <Typography variant="h3" sx={{ fontSize: "1.85rem", letterSpacing: "-0.04em" }}>
              {formatHours(averagePerDay)} hrs
            </Typography>
          </Box>
        </PanelCard>
      </Box>
    </Box>
  );
}
