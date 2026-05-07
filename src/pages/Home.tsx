import { lazy, Suspense, useEffect, useState } from "react";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";

const DashboardHero = lazy(() => import("../features/dashboard/components/DashboardHero"));
import TopProjectsCard from "../features/dashboard/components/TopProjectsCard";
import WeeklyStatsCard from "../features/dashboard/components/WeeklyStatsCard";
import SummaryCard from "../features/dashboard/components/SummaryCard";
import TeamMemberDashboardPanel from "../features/dashboard/components/TeamMemberDashboardPanel";
import { useAuth } from "../hooks/useAuth";
import { useDashboardData } from "../features/dashboard/hooks/useDashboardData";
import { useManagedTeam } from "../features/dashboard/hooks/useManagedTeam";

const ROW_GAP = 3;

type DashboardTab = "mine" | "team";

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
  const { team } = useManagedTeam(user);

  const isManager = team.length > 0;
  const [activeTab, setActiveTab] = useState<DashboardTab>("mine");
  const [selectedMemberUid, setSelectedMemberUid] = useState<string | null>(null);

  // Default to first member, and stay on a valid member as the team list updates.
  useEffect(() => {
    if (team.length === 0) {
      setSelectedMemberUid(null);
      return;
    }
    setSelectedMemberUid((current) => {
      if (current && team.some((m) => m.uid === current)) return current;
      return team[0].uid;
    });
  }, [team]);

  return (
    <>
      {/* Row 0 — Hero */}
      <Suspense fallback={<Box sx={{ minHeight: 200, mb: 3 }} />}>
        <DashboardHero
          averagePerDay={averagePerDay}
          firstName={firstName}
          peakDayLabel={highestPoint.day}
          recentEntriesLabel={recentEntriesLabel}
          recentLogCount={recentLogs.length}
          todayLabel={todayLabel}
        />
      </Suspense>

      {isManager && (
        <Box sx={{ mb: 3, borderBottom: 1, borderColor: "divider" }}>
          <Tabs
            value={activeTab}
            onChange={(_, value: DashboardTab) => setActiveTab(value)}
          >
            <Tab value="mine" label="My work" />
            <Tab value="team" label="My team" />
          </Tabs>
        </Box>
      )}

      {(!isManager || activeTab === "mine") && (
        <>
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
      )}

      {isManager && activeTab === "team" && (
        <>
          <Box sx={{ mb: 3 }}>
            <Tabs
              value={selectedMemberUid ?? false}
              onChange={(_, value: string) => setSelectedMemberUid(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              {team.map((member) => (
                <Tab key={member.uid} value={member.uid} label={member.fullName} />
              ))}
            </Tabs>
          </Box>

          {selectedMemberUid && (
            <TeamMemberDashboardPanel
              key={selectedMemberUid}
              uid={selectedMemberUid}
            />
          )}
        </>
      )}
    </>
  );
}
