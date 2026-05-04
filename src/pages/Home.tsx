import { Box, Grid } from "@mui/material";
import DashboardHero from "../features/dashboard/components/DashboardHero";
import TopProjectsCard from "../features/dashboard/components/TopProjectsCard";
import WeeklyStatsCard from "../features/dashboard/components/WeeklyStatsCard";
import SummaryCard from "../features/dashboard/components/SummaryCard";
import { useAuth } from "../hooks/useAuth";
import { useDashboardData } from "../features/dashboard/hooks/useDashboardData";

const ROW_GAP = 3;

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const {
    averagePerDay,
    firstName,
    highestPoint,
    historyEntries,
    isDashboardLoading,
    last14DaysLogged,
    last7DaysHours,
    last7DaysRemotePct,
    recentEntriesLabel,
    recentLogs,
    remoteHours,
    remotePct,
    streakDays,
    todayLabel,
    topProjects,
    weeklyDelta,
    weeklyTotal,
  } = useDashboardData({ user, authLoading });

  return (
    <>
      {/* Row 0 — Hero */}
      <DashboardHero
        averagePerDay={averagePerDay}
        firstName={firstName}
        peakDayLabel={highestPoint.day}
        recentEntriesLabel={recentEntriesLabel}
        recentLogCount={recentLogs.length}
        todayLabel={todayLabel}
      />

      {/* Row 1 — Stat tiles (left) + Top projects (right) */}
      <Grid container spacing={{ xs: 2, md: 2 }} alignItems="stretch">
        <Grid size={{ xs: 12, md: 6 }}>
          <WeeklyStatsCard
            isLoading={isDashboardLoading}
            last14DaysLogged={last14DaysLogged}
            last7DaysHours={last7DaysHours}
            last7DaysRemotePct={last7DaysRemotePct}
            remoteHours={remoteHours}
            remotePct={remotePct}
            streakDays={streakDays}
            weeklyDelta={weeklyDelta}
            weeklyTotal={weeklyTotal}
          />
        </Grid>
        <Grid size={{ xs: 12, md: 6 }}>
          <TopProjectsCard isLoading={isDashboardLoading} topProjects={topProjects} />
        </Grid>
      </Grid>

      {/* Row 2 — Summary card */}
      <Box sx={{ mt: ROW_GAP }}>
        <SummaryCard historyEntries={historyEntries} isLoading={isDashboardLoading} />
      </Box>
    </>
  );
}
