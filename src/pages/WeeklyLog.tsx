import { Alert, Box, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import WeeklyOverviewCard from "../features/dashboard/components/WeeklyOverviewCard";
import { useDashboardData } from "../features/dashboard/hooks/useDashboardData";
import { useAuth } from "../hooks/useAuth";

export default function WeeklyLog() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const {
    activeDays,
    activeDaysLabel,
    averagePerDay,
    dashboardErrors,
    highestPoint,
    weeklyOverview,
    weeklyTotal,
  } = useDashboardData({ user, authLoading });

  return (
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Stack spacing={2.5}>
        <Box sx={{ textAlign: "center", maxWidth: 640, mx: "auto" }}>
        </Box>

        {dashboardErrors.map((error) => (
          <Alert key={error} severity="warning">
            {error}
          </Alert>
        ))}

        <WeeklyOverviewCard
          days={weeklyOverview}
          totalHours={weeklyTotal}
          activeDays={activeDays}
          activeDaysLabel={activeDaysLabel}
          peakDay={highestPoint}
          averagePerDay={averagePerDay}
          onOpenCalendar={() => navigate("/calendar")}
        />

        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.25, sm: 2.5 },
            borderRadius: "24px",
            borderColor: "rgba(255,255,255,0.8)",
            backgroundColor: "rgba(255,255,255,0.56)",
          }}
        >
          <Typography variant="body1" sx={{ color: "#5f6685" }}>
            Day-by-day entry list coming soon
          </Typography>
        </Paper>
      </Stack>
    </Box>
  );
}
