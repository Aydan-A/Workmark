import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import SummaryCard from "./SummaryCard";
import WeeklyStatsCard from "./WeeklyStatsCard";
import { useTeamMemberData } from "../hooks/useTeamMemberData";

type TeamMemberDashboardPanelProps = {
  uid: string;
};

export default function TeamMemberDashboardPanel({ uid }: TeamMemberDashboardPanelProps) {
  const data = useTeamMemberData(uid);

  return (
    <>
      <Grid container spacing={{ xs: 2, md: 2 }} alignItems="stretch">
        <Grid size={{ xs: 12 }}>
          <WeeklyStatsCard
            isLoading={data.isLoading}
            last14DaysLogged={data.last14DaysLogged}
            last7DaysHours={data.last7DaysHours}
            last7DaysRemotePct={data.last7DaysRemotePct}
            remoteHours={data.remoteHours}
            remotePct={data.remotePct}
            streakDays={data.streakDays}
            weeklyDelta={data.weeklyDelta}
            weeklyTotal={data.weeklyTotal}
          />
        </Grid>
      </Grid>

      <Box sx={{ mt: 3 }}>
        <SummaryCard
          historyEntries={data.historyEntries}
          isLoading={data.isLoading}
          readOnly
        />
      </Box>
    </>
  );
}
