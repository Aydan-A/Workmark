import DashboardHero from "../features/dashboard/components/DashboardHero";
import { useAuth } from "../hooks/useAuth";
import { useDashboardData } from "../features/dashboard/hooks/useDashboardData";

export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const {
    averagePerDay,
    firstName,
    highestPoint,
    recentEntriesLabel,
    recentLogs,
    todayLabel,
  } = useDashboardData({ user, authLoading });

  return (
    <DashboardHero
      averagePerDay={averagePerDay}
      firstName={firstName}
      peakDayLabel={highestPoint.day}
      recentEntriesLabel={recentEntriesLabel}
      recentLogCount={recentLogs.length}
      todayLabel={todayLabel}
    />
  );
}
