import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { endOfWeek, format, startOfWeek } from "date-fns";
import { getEntryLoadErrorMessage, subscribeToEntries } from "../../entries/entry.api";
import type { WorkEntry } from "../../entries/entry.types";
import {
  buildRecentDashboardLogs,
  buildWeeklyOverview,
  getHoursForDate,
} from "../../entries/entry.utils";

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
  const todayHours = getHoursForDate(weeklyEntries, todayKey);
  const recentEntriesLabel = recentLogs.length === 1 ? "recent log" : "recent logs";
  const activeDaysLabel = activeDays === 1 ? "active day" : "active days";
  const dashboardErrors = [...new Set([recentLoadError, weeklyLoadError].filter((error): error is string => Boolean(error)))];
  const isDashboardLoading = authLoading || isRecentLoading || isWeeklyLoading;
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
    highestPoint,
    isDashboardLoading,
    recentEntriesLabel,
    recentHelperText,
    recentLogs,
    todayHours,
    todayLabel,
    weeklyOverview,
    weeklyTotal,
  };
}
