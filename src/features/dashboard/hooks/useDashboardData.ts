import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { endOfWeek, format, getDay, startOfWeek, subDays } from "date-fns";
import { useEntriesQuery } from "../../entries/useEntriesQuery";
import { getEntryLoadErrorMessage } from "../../entries/entry.api";
import { subscribeToProjects } from "../../entries/project.api";
import type {
  DashboardRecentEntry,
  HeatmapDay,
  Project,
  TopProjectStat,
} from "../../entries/entry.types";
import {
  buildRecentDashboardLogs,
  buildTopProjectStats,
  buildWeeklyOverview,
  calcStreakDays,
  getHoursForDate,
  getTotalRemoteHours,
} from "../../entries/entry.utils";
import {
  buildHeatmapGrid,
  getLast7DaysHours,
  getLast7DaysRemotePct,
  getHeatmapTotalHours,
  getStreakDots,
  groupByWeekday,
} from "../dashboard.utils";

type UseDashboardDataOptions = {
  user: User | null;
  authLoading: boolean;
};

function getFirstName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return "Aydan";
  return trimmed.split(/\s+/)[0] || "Aydan";
}

export function useDashboardData({ user, authLoading }: UseDashboardDataOptions) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoadError, setProjectsLoadError] = useState<string | null>(null);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);

  const now = new Date();
  const todayLabel = format(now, "EEEE, MMMM d");
  const todayKey = format(now, "yyyy-MM-dd");
  const referenceDate = useMemo(() => new Date(`${todayKey}T00:00:00`), [todayKey]);
  const weekStartKey = format(startOfWeek(referenceDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEndKey = format(endOfWeek(referenceDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeekStartKey = format(startOfWeek(subDays(referenceDate, 7), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeekEndKey = format(endOfWeek(subDays(referenceDate, 7), { weekStartsOn: 1 }), "yyyy-MM-dd");
  // 90 days covers 12 heatmap weeks (84 days) plus streak buffer
  const historyStartKey = format(subDays(referenceDate, 90), "yyyy-MM-dd");

  const uid = user?.uid ?? null;

  const recentQuery = useEntriesQuery(
    uid,
    { orderDirection: "desc", limitCount: 5 },
    Boolean(user),
  );
  const weeklyQuery = useEntriesQuery(
    uid,
    { startDate: weekStartKey, endDate: weekEndKey, orderDirection: "asc" },
    Boolean(user),
  );
  // Covers last 90 days — drives heatmap, streak, last-week delta, sparklines.
  const historyQuery = useEntriesQuery(
    uid,
    { startDate: historyStartKey, endDate: todayKey, orderDirection: "asc" },
    Boolean(user),
  );

  const recentEntries = recentQuery.entries;
  const weeklyEntries = weeklyQuery.entries;
  const historyEntries = historyQuery.entries;
  const recentLoadError = recentQuery.error;
  const weeklyLoadError = weeklyQuery.error;
  const historyLoadError = historyQuery.error;
  const isRecentLoading = recentQuery.isLoading;
  const isWeeklyLoading = weeklyQuery.isLoading;
  const isHistoryLoading = historyQuery.isLoading;

  useEffect(() => {
    if (!user) {
      setProjects([]);
      setProjectsLoadError(null);
      setIsProjectsLoading(false);
      return;
    }
    setIsProjectsLoading(true);
    const unsubscribe = subscribeToProjects(
      (list) => { setProjects(list); setProjectsLoadError(null); setIsProjectsLoading(false); },
      (error) => { setProjectsLoadError(getEntryLoadErrorMessage(error)); setIsProjectsLoading(false); },
    );
    return unsubscribe;
  }, [user]);

  // ── Weekly overview ───────────────────────────────────────────────────────
  const recentLogs = useMemo(
    () => buildRecentDashboardLogs(recentEntries, referenceDate),
    [recentEntries, referenceDate],
  );
  const weeklyOverview = useMemo(
    () => buildWeeklyOverview(weeklyEntries, referenceDate),
    [referenceDate, weeklyEntries],
  );

  const weeklyTotal = weeklyOverview.reduce((sum, d) => sum + d.hours, 0);
  const averagePerDay = weeklyTotal / weeklyOverview.length;
  const activeDays = weeklyOverview.filter((d) => d.hours > 0).length;
  const highestPoint = weeklyOverview.reduce(
    (best, item) => (item.hours > best.hours ? item : best),
    weeklyOverview[0],
  );
  const todayHours = getHoursForDate(weeklyEntries, todayKey);

  const lastWeekEntries = useMemo(
    () => historyEntries.filter((e) => e.date >= lastWeekStartKey && e.date <= lastWeekEndKey),
    [historyEntries, lastWeekStartKey, lastWeekEndKey],
  );
  const lastWeekTotal = lastWeekEntries.reduce((sum, e) => sum + e.hours, 0);
  const weeklyDelta = weeklyTotal - lastWeekTotal;

  const remoteHours = getTotalRemoteHours(weeklyEntries);
  const remotePct = weeklyTotal > 0 ? Math.round((remoteHours / weeklyTotal) * 100) : 0;

  const streakDays = useMemo(
    () => calcStreakDays(historyEntries, referenceDate),
    [historyEntries, referenceDate],
  );

  // ── Project color map ─────────────────────────────────────────────────────
  const projectColorMap = useMemo(
    () => new Map(projects.map((p): [string, string | undefined] => [p.id, p.color])),
    [projects],
  );
  const topProjects: TopProjectStat[] = useMemo(
    () => buildTopProjectStats(weeklyEntries, projectColorMap, 3),
    [weeklyEntries, projectColorMap],
  );

  // ── Heatmap ───────────────────────────────────────────────────────────────
  const heatmapGrid: HeatmapDay[] = useMemo(
    () => buildHeatmapGrid(historyEntries, referenceDate),
    [historyEntries, referenceDate],
  );
  const heatmapTotalHours = useMemo(
    () => getHeatmapTotalHours(historyEntries, referenceDate),
    [historyEntries, referenceDate],
  );

  // ── Weekly rhythm chart ───────────────────────────────────────────────────
  const hoursByWeekday = useMemo(
    () => groupByWeekday(historyEntries, referenceDate, 4),
    [historyEntries, referenceDate],
  );
  const todayWeekday = (() => {
    const dow = getDay(referenceDate); // 0=Sun … 6=Sat
    return dow === 0 ? 6 : dow - 1;   // Mon=0 … Sun=6
  })();

  // ── Sparklines ────────────────────────────────────────────────────────────
  const last7DaysHours = useMemo(
    () => getLast7DaysHours(historyEntries, referenceDate),
    [historyEntries, referenceDate],
  );
  const last7DaysRemotePct = useMemo(
    () => getLast7DaysRemotePct(historyEntries, referenceDate),
    [historyEntries, referenceDate],
  );
  const last14DaysLogged = useMemo(
    () => getStreakDots(historyEntries, referenceDate, 14),
    [historyEntries, referenceDate],
  );

  // ── Recent activity (with project colors) ────────────────────────────────
  const recentLogItems: DashboardRecentEntry[] = useMemo(
    () =>
      recentEntries.slice(0, 5).map((e) => ({
        id: e.id,
        projectName: e.projectName,
        projectColor: projectColorMap.get(e.projectId),
        hours: e.hours,
        date: e.date,
        createdAt: e.createdAt,
      })),
    [recentEntries, projectColorMap],
  );

  // ── Labels / errors / loading ─────────────────────────────────────────────
  const recentEntriesLabel = recentLogs.length === 1 ? "recent log" : "recent logs";
  const activeDaysLabel = activeDays === 1 ? "active day" : "active days";
  const dashboardErrors = [
    ...new Set(
      [recentLoadError, weeklyLoadError, historyLoadError, projectsLoadError].filter(
        (e): e is string => Boolean(e),
      ),
    ),
  ];
  const isDashboardLoading =
    authLoading || isRecentLoading || isWeeklyLoading || isHistoryLoading || isProjectsLoading;
  const recentHelperText = !user
    ? "Sign in to view activity"
    : isDashboardLoading
      ? "Loading your latest entries"
      : recentLogs.length > 0
        ? "Latest saved work logs"
        : "No recent activity yet";
  const displayName = user?.displayName?.trim() || "Aydan Abbasli";
  const firstName = getFirstName(displayName);

  return {
    activeDays,
    activeDaysLabel,
    averagePerDay,
    dashboardErrors,
    firstName,
    heatmapGrid,
    heatmapTotalHours,
    historyEntries,
    highestPoint,
    hoursByWeekday,
    isDashboardLoading,
    last14DaysLogged,
    last7DaysHours,
    last7DaysRemotePct,
    recentEntriesLabel,
    recentHelperText,
    recentLogItems,
    recentLogs,
    remoteHours,
    remotePct,
    streakDays,
    todayHours,
    todayLabel,
    todayWeekday,
    topProjects,
    weeklyDelta,
    weeklyOverview,
    weeklyTotal,
  };
}
