import { addDays, format, getDay, startOfWeek } from "date-fns";
import { formatHours, parseDateKey } from "../entries/entry.utils";
import type { HeatmapDay, WorkEntry } from "../entries/entry.types";

export function formatHM(hours: number): string {
  return formatHours(hours);
}

export function formatPct(pct: number): string {
  return `${pct}%`;
}

// Builds an 84-cell (12 weeks × 7 days) grid for the activity heatmap.
// Items are ordered week-major, day-minor (Mon–Sun within each week), oldest first.
export function buildHeatmapGrid(
  entries: WorkEntry[],
  referenceDate: Date = new Date(),
): HeatmapDay[] {
  const currentWeekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const gridStart = addDays(currentWeekStart, -11 * 7);
  const todayKey = format(referenceDate, "yyyy-MM-dd");

  const dayMap = new Map<string, { hours: number; projectIds: Set<string> }>();
  for (const entry of entries) {
    const slot = dayMap.get(entry.date) ?? { hours: 0, projectIds: new Set<string>() };
    slot.hours += entry.hours;
    slot.projectIds.add(entry.projectId);
    dayMap.set(entry.date, slot);
  }

  const grid: HeatmapDay[] = [];
  for (let weekIndex = 0; weekIndex < 12; weekIndex++) {
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const date = addDays(gridStart, weekIndex * 7 + dayIndex);
      const dateKey = format(date, "yyyy-MM-dd");
      const slot = dayMap.get(dateKey);
      grid.push({
        dateKey,
        hours: slot?.hours ?? 0,
        projectCount: slot?.projectIds.size ?? 0,
        weekIndex,
        dayIndex,
        isFuture: dateKey > todayKey,
      });
    }
  }

  return grid;
}

// Total hours logged within the last 12-week heatmap window.
export function getHeatmapTotalHours(
  entries: WorkEntry[],
  referenceDate: Date = new Date(),
): number {
  const currentWeekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const gridStartKey = format(addDays(currentWeekStart, -11 * 7), "yyyy-MM-dd");
  const todayKey = format(referenceDate, "yyyy-MM-dd");
  return entries
    .filter((e) => e.date >= gridStartKey && e.date <= todayKey)
    .reduce((sum, e) => sum + e.hours, 0);
}

// Average hours per weekday (Mon=0 … Sun=6) over the last `weeksBack` weeks.
export function groupByWeekday(
  entries: WorkEntry[],
  referenceDate: Date = new Date(),
  weeksBack = 4,
): number[] {
  const currentWeekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const startKey = format(addDays(currentWeekStart, -(weeksBack - 1) * 7), "yyyy-MM-dd");
  const endKey = format(referenceDate, "yyyy-MM-dd");

  const totals = [0, 0, 0, 0, 0, 0, 0];
  for (const entry of entries) {
    if (entry.date < startKey || entry.date > endKey) continue;
    const dow = getDay(parseDateKey(entry.date)); // 0=Sun … 6=Sat
    const idx = dow === 0 ? 6 : dow - 1;          // Mon=0 … Sun=6
    totals[idx] += entry.hours;
  }

  return totals.map((total) => total / weeksBack);
}

// Returns `days` booleans (oldest first) — true if at least one hour was logged.
export function getStreakDots(
  entries: WorkEntry[],
  referenceDate: Date = new Date(),
  days = 14,
): boolean[] {
  const logged = new Set(entries.filter((e) => e.hours > 0).map((e) => e.date));
  return Array.from({ length: days }, (_, i) => {
    const key = format(addDays(referenceDate, -(days - 1 - i)), "yyyy-MM-dd");
    return logged.has(key);
  });
}

// Hours logged per day for the last 7 days (oldest first).
export function getLast7DaysHours(
  entries: WorkEntry[],
  referenceDate: Date = new Date(),
): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const key = format(addDays(referenceDate, -(6 - i)), "yyyy-MM-dd");
    return entries.filter((e) => e.date === key).reduce((sum, e) => sum + e.hours, 0);
  });
}

// Remote % (0–100) per day for the last 7 days (oldest first).
export function getLast7DaysRemotePct(
  entries: WorkEntry[],
  referenceDate: Date = new Date(),
): number[] {
  return Array.from({ length: 7 }, (_, i) => {
    const key = format(addDays(referenceDate, -(6 - i)), "yyyy-MM-dd");
    const day = entries.filter((e) => e.date === key);
    const total = day.reduce((sum, e) => sum + e.hours, 0);
    if (total === 0) return 0;
    const remote = day.filter((e) => e.isRemote).reduce((sum, e) => sum + e.hours, 0);
    return Math.round((remote / total) * 100);
  });
}
