import { useEffect, useMemo, useState } from "react";
import { startOfMonth } from "date-fns";
import { useAuth } from "../../../hooks/useAuth";
import {
  getEntryLoadErrorMessage,
  subscribeToMonthEntries,
} from "../../entries/entry.api";
import { findTopProject } from "../../entries/entry.utils";
import type { WorkEntry } from "../../entries/entry.types";
import type { WeeklyTopProject } from "../../entries/entry.types";
import { buildCalendarDays } from "../calendar.utils";
import type { CalendarDay } from "../calendar.utils";

export type CalendarData = {
  visibleMonth: Date;
  monthTotalHours: number;
  remoteHours: number;
  loggedDays: number;
  topProject: WeeklyTopProject | null;
  days: CalendarDay[];
  loadError: string | null;
  isLoading: boolean;
  goToPrevMonth: () => void;
  goToNextMonth: () => void;
  goToToday: () => void;
};

export function useCalendarData(): CalendarData {
  const { user } = useAuth();
  const [visibleMonth, setVisibleMonth] = useState<Date>(() => startOfMonth(new Date()));
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToMonthEntries(
      visibleMonth,
      (incoming) => {
        setEntries(incoming);
        setLoadError(null);
        setIsLoading(false);
      },
      (error) => {
        setLoadError(getEntryLoadErrorMessage(error));
        setIsLoading(false);
      },
    );

    return unsubscribe;
  }, [user, visibleMonth]);

  const hoursByDate = useMemo(() => {
    const map = new Map<string, number>();
    for (const entry of entries) {
      map.set(entry.date, (map.get(entry.date) ?? 0) + entry.hours);
    }
    return map;
  }, [entries]);

  const monthTotalHours = useMemo(
    () => entries.reduce((sum, e) => sum + e.hours, 0),
    [entries],
  );

  const remoteHours = useMemo(
    () => entries.reduce((sum, e) => sum + (e.isRemote ? e.hours : 0), 0),
    [entries],
  );

  const loggedDays = hoursByDate.size;

  const topProject = useMemo(() => findTopProject(entries), [entries]);

  const days = useMemo(
    () => buildCalendarDays(visibleMonth, hoursByDate),
    [visibleMonth, hoursByDate],
  );

  const goToPrevMonth = () =>
    setVisibleMonth((prev) =>
      startOfMonth(new Date(prev.getFullYear(), prev.getMonth() - 1, 1)),
    );

  const goToNextMonth = () =>
    setVisibleMonth((prev) =>
      startOfMonth(new Date(prev.getFullYear(), prev.getMonth() + 1, 1)),
    );

  const goToToday = () => setVisibleMonth(startOfMonth(new Date()));

  return {
    visibleMonth,
    monthTotalHours,
    remoteHours,
    loggedDays,
    topProject,
    days,
    loadError,
    isLoading,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
  };
}
