import { addDays, endOfWeek, format, startOfWeek, subWeeks } from "date-fns";
import { parseDateKey } from "../entries/entry.utils";
import type { WorkEntry, WeeklyPoint } from "../entries/entry.types";

export type WeeklyRange = "this" | "last" | "last2" | "last4";

export function getRangeBoundaries(
  range: WeeklyRange,
  referenceDate: Date = new Date(),
): { start: string; end: string } {
  switch (range) {
    case "this": {
      return {
        start: format(startOfWeek(referenceDate, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        end: format(endOfWeek(referenceDate, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    }
    case "last": {
      const lastWeek = subWeeks(referenceDate, 1);
      return {
        start: format(startOfWeek(lastWeek, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        end: format(endOfWeek(lastWeek, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    }
    case "last2": {
      const twoWeeksAgo = subWeeks(referenceDate, 2);
      const lastWeek = subWeeks(referenceDate, 1);
      return {
        start: format(startOfWeek(twoWeeksAgo, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        end: format(endOfWeek(lastWeek, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    }
    case "last4": {
      const fourWeeksAgo = subWeeks(referenceDate, 4);
      const lastWeek = subWeeks(referenceDate, 1);
      return {
        start: format(startOfWeek(fourWeeksAgo, { weekStartsOn: 1 }), "yyyy-MM-dd"),
        end: format(endOfWeek(lastWeek, { weekStartsOn: 1 }), "yyyy-MM-dd"),
      };
    }
  }
}

export function buildRangeOverview(
  entries: WorkEntry[],
  start: string,
  end: string,
  todayKey: string,
): WeeklyPoint[] {
  const hoursByDate = new Map<string, number>();
  for (const entry of entries) {
    hoursByDate.set(entry.date, (hoursByDate.get(entry.date) ?? 0) + entry.hours);
  }

  const points: WeeklyPoint[] = [];
  let cursor = parseDateKey(start);
  const endDate = parseDateKey(end);

  while (cursor <= endDate) {
    const dateKey = format(cursor, "yyyy-MM-dd");
    points.push({
      dateKey,
      day: format(cursor, "EEE"),
      dateLabel: format(cursor, "MMM d"),
      hours: hoursByDate.get(dateKey) ?? 0,
      isToday: dateKey === todayKey,
    });
    cursor = addDays(cursor, 1);
  }

  return points;
}

export function getRangeSubtitle(range: WeeklyRange): string {
  switch (range) {
    case "this": return "Your hours across the current week.";
    case "last": return "Your hours from last week.";
    case "last2": return "Your hours across the last 2 weeks.";
    case "last4": return "Your hours across the last 4 weeks.";
  }
}
