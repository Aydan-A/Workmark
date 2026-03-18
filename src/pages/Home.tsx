import {
  AccessTimeRounded,
  CalendarMonthRounded,
  NotesRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { format } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import PanelCard from "../components/common/PanelCard";
import StatCard from "../components/common/StatCard";
import { dashboardMockData } from "../features/dashboard/mockData";

function formatHours(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export default function Home() {
  const theme = useTheme();
  const todayLabel = format(new Date(), "EEEE, MMMM d");
  const weeklyTotal = dashboardMockData.weeklyOverview.reduce((sum, day) => sum + day.hours, 0);
  const averagePerDay = weeklyTotal / dashboardMockData.weeklyOverview.length;
  const highestDay = Math.max(...dashboardMockData.weeklyOverview.map((day) => day.hours), 1);

  const statCards = [
    {
      label: "Today's Hours",
      value: "0",
      suffix: "hrs",
      icon: <AccessTimeRounded fontSize="small" />,
    },
    {
      label: "This Week",
      value: formatHours(weeklyTotal),
      suffix: "hrs",
      icon: <CalendarMonthRounded fontSize="small" />,
    },
    {
      label: "Total Entries",
      value: String(dashboardMockData.recentLogs.length),
      icon: <NotesRounded fontSize="small" />,
    },
  ];

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        alignItems={{ xs: "flex-start", md: "center" }}
        justifyContent="space-between"
        spacing={3}
        sx={{ mb: 3.5 }}
      >
        <Box>
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: "2rem", md: "2.45rem" },
              letterSpacing: "-0.03em",
            }}
          >
            Welcome back, {dashboardMockData.user.firstName}
          </Typography>
          <Typography variant="subtitle1" sx={{ mt: 1, color: "text.secondary" }}>
            {todayLabel}
          </Typography>
        </Box>

        <Button
          component={RouterLink}
          to="/today"
          variant="contained"
          size="large"
          sx={{ minWidth: { xs: "100%", sm: 180 }, px: 3, py: 1.35 }}
        >
          Log Today
        </Button>
      </Stack>

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
        <PanelCard title="Recent Logs" actionLabel="View all" actionTo="/weekly">
          <Stack spacing={2.25}>
            {dashboardMockData.recentLogs.map((log) => (
              <Box
                key={log.id}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", sm: "88px minmax(0, 1fr)" },
                  gap: 2,
                }}
              >
                <Box
                  sx={{
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.12),
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    px: 2,
                    py: 1.75,
                    textAlign: { xs: "left", sm: "center" },
                  }}
                >
                  <Typography variant="h3" sx={{ fontSize: "1.85rem", letterSpacing: "-0.03em" }}>
                    {formatHours(log.hours)}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>
                    hrs
                  </Typography>
                </Box>

                <Box>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
                    <Typography variant="h3" sx={{ fontSize: "1.25rem" }}>
                      {log.title}
                    </Typography>
                    <Chip
                      label={log.location}
                      size="small"
                      sx={{
                        bgcolor: "rgba(112, 87, 246, 0.08)",
                        color: "text.secondary",
                        fontWeight: 500,
                      }}
                    />
                  </Stack>
                  <Typography variant="body1" sx={{ mt: 1, color: "text.secondary", maxWidth: 54 + "ch" }}>
                    {log.summary}
                  </Typography>
                  <Typography variant="subtitle2" sx={{ mt: 1.25, color: "#9aa0b5" }}>
                    {log.dateLabel}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Stack>
        </PanelCard>

        <PanelCard title="Weekly Overview" actionLabel="Calendar" actionTo="/calendar">
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
              gap: 1.5,
              alignItems: "end",
              minHeight: 292,
            }}
          >
            {dashboardMockData.weeklyOverview.map((item) => {
              const ratio = item.hours / highestDay;
              const barHeight = item.hours === 0 ? "10%" : String(Math.max(ratio * 100, 28)) + "%";

              return (
                <Box key={item.day} sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1.25 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-end", width: "100%", height: 220 }}>
                    <Box
                      sx={{
                        width: "100%",
                        height: barHeight,
                        borderRadius: "18px 18px 10px 10px",
                        bgcolor:
                          item.hours === 0
                            ? alpha(theme.palette.primary.main, 0.12)
                            : "primary.main",
                        boxShadow:
                          item.hours === 0
                            ? "none"
                            : "0 14px 30px rgba(112, 87, 246, 0.18)",
                      }}
                    />
                  </Box>
                  <Typography variant="subtitle2" sx={{ color: "#9aa0b5" }}>
                    {item.day}
                  </Typography>
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              mt: 3,
              pt: 2.5,
              borderTop: "1px solid",
              borderColor: "divider",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 2,
            }}
          >
            <Typography variant="subtitle1" sx={{ color: "text.secondary" }}>
              Average per day
            </Typography>
            <Typography variant="h3" sx={{ fontSize: "1.75rem", letterSpacing: "-0.03em" }}>
              {formatHours(averagePerDay)} hrs
            </Typography>
          </Box>
        </PanelCard>
      </Box>
    </Box>
  );
}
