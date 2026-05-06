import { useEffect, useMemo, useState } from "react";
import { endOfWeek, format, startOfWeek, subDays } from "date-fns";
import {
  getEntryLoadErrorMessage,
  subscribeToEntriesForRange,
} from "../../entries/entry.api";
import type { WorkEntry } from "../../entries/entry.types";
import { calcStreakDays, getTotalRemoteHours } from "../../entries/entry.utils";
import {
  getLast7DaysHours,
  getLast7DaysRemotePct,
  getStreakDots,
} from "../dashboard.utils";

export function useTeamMemberData(uid: string | null) {
  const [historyEntries, setHistoryEntries] = useState<WorkEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const now = new Date();
  const todayKey = format(now, "yyyy-MM-dd");
  const referenceDate = useMemo(() => new Date(`${todayKey}T00:00:00`), [todayKey]);
  const weekStartKey = format(startOfWeek(referenceDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEndKey = format(endOfWeek(referenceDate, { weekStartsOn: 1 }), "yyyy-MM-dd");
  const lastWeekStartKey = format(
    startOfWeek(subDays(referenceDate, 7), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const lastWeekEndKey = format(
    endOfWeek(subDays(referenceDate, 7), { weekStartsOn: 1 }),
    "yyyy-MM-dd",
  );
  const historyStartKey = format(subDays(referenceDate, 90), "yyyy-MM-dd");

  useEffect(() => {
    // Clear previous member's data immediately to avoid flicker between switches.
    setHistoryEntries([]);
    setError(null);

    if (!uid) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const unsubscribe = subscribeToEntriesForRange(
      uid,
      historyStartKey,
      todayKey,
      (entries) => {
        setHistoryEntries(entries);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        setError(getEntryLoadErrorMessage(err));
        setIsLoading(false);
      },
    );
    return unsubscribe;
  }, [uid, historyStartKey, todayKey]);

  const weeklyEntries = useMemo(
    () => historyEntries.filter((e) => e.date >= weekStartKey && e.date <= weekEndKey),
    [historyEntries, weekStartKey, weekEndKey],
  );
  const lastWeekEntries = useMemo(
    () =>
      historyEntries.filter(
        (e) => e.date >= lastWeekStartKey && e.date <= lastWeekEndKey,
      ),
    [historyEntries, lastWeekStartKey, lastWeekEndKey],
  );

  const weeklyTotal = weeklyEntries.reduce((sum, e) => sum + e.hours, 0);
  const lastWeekTotal = lastWeekEntries.reduce((sum, e) => sum + e.hours, 0);
  const weeklyDelta = weeklyTotal - lastWeekTotal;
  const remoteHours = getTotalRemoteHours(weeklyEntries);
  const remotePct = weeklyTotal > 0 ? Math.round((remoteHours / weeklyTotal) * 100) : 0;

  const streakDays = useMemo(
    () => calcStreakDays(historyEntries, referenceDate),
    [historyEntries, referenceDate],
  );
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

  return {
    historyEntries,
    isLoading,
    error,
    weeklyTotal,
    weeklyDelta,
    remoteHours,
    remotePct,
    streakDays,
    last7DaysHours,
    last7DaysRemotePct,
    last14DaysLogged,
  };
}
