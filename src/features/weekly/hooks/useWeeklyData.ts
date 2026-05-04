import { useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import type { User } from "firebase/auth";
import {
  getEntryLoadErrorMessage,
  subscribeToEntries,
} from "../../entries/entry.api";
import type { WeeklyPoint, WorkEntry } from "../../entries/entry.types";
import { buildRangeOverview } from "../weekly.utils";

type UseWeeklyDataOptions = {
  user: User | null;
  authLoading: boolean;
  start: string;
  end: string;
};

const EMPTY_POINT: WeeklyPoint = {
  dateKey: "",
  day: "Mon",
  dateLabel: "",
  hours: 0,
  isToday: false,
};

export function useWeeklyData({ user, authLoading: _authLoading, start, end }: UseWeeklyDataOptions) {
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const todayKey = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    const unsubscribe = subscribeToEntries(
      (data) => { setEntries(data); setLoadError(null); setIsLoading(false); },
      (error) => { setLoadError(getEntryLoadErrorMessage(error)); setIsLoading(false); },
      { startDate: start, endDate: end, orderDirection: "asc" },
    );
    return unsubscribe;
  }, [user, start, end]);

  const weeklyOverview = useMemo(
    () => buildRangeOverview(entries, start, end, todayKey),
    [entries, start, end, todayKey],
  );

  const weeklyTotal = weeklyOverview.reduce((sum, d) => sum + d.hours, 0);
  const activeDays = weeklyOverview.filter((d) => d.hours > 0).length;
  const activeDaysLabel = activeDays === 1 ? "active day" : "active days";
  const averagePerDay = weeklyOverview.length > 0 ? weeklyTotal / weeklyOverview.length : 0;
  const highestPoint = weeklyOverview.reduce(
    (best, item) => (item.hours > best.hours ? item : best),
    weeklyOverview[0] ?? EMPTY_POINT,
  );
  const todayInRange = todayKey >= start && todayKey <= end;
  const dashboardErrors = loadError ? [loadError] : [];

  return {
    activeDays,
    activeDaysLabel,
    averagePerDay,
    dashboardErrors,
    highestPoint,
    isLoading,
    todayInRange,
    weeklyOverview,
    weeklyTotal,
  };
}
