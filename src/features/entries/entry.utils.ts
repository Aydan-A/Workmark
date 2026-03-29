import {
  addDays,
  differenceInCalendarDays,
  format,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type { WorkEntry } from "./entry.types";

export type DashboardLog = {
  id: string;
  title: string;
  location: string;
  summary: string;
  hours: number;
  dateLabel: string;
};

export type WeeklyPoint = {
  day: string;
  hours: number;
};

function parseDateKey(dateKey: string): Date {
  return new Date(`${dateKey}T00:00:00`);
}

export function getEntryPrimaryLabel(entry: WorkEntry): string {
  const primaryProject = entry.projects.find((project) => project.trim().length > 0);
  return primaryProject?.trim() || entry.project?.trim() || "Work log";
}

export function getEntryLocationLabel(entry: WorkEntry): string {
  if (entry.remoteHours <= 0) return "On-site";
  if (entry.remoteHours >= entry.totalHours) return "Remote";
  return "Hybrid";
}

export function getEntrySummary(entry: WorkEntry): string {
  return entry.description.trim() || "No notes added.";
}

export function formatEntryDateLabel(dateKey: string, referenceDate: Date = new Date()): string {
  const entryDate = parseDateKey(dateKey);
  const dayDifference = differenceInCalendarDays(startOfDay(referenceDate), entryDate);

  if (dayDifference === 0) return "Today";
  if (dayDifference === 1) return "Yesterday";

  return format(entryDate, "MMM d");
}

export function buildRecentDashboardLogs(
  entries: WorkEntry[],
  referenceDate: Date = new Date(),
  maxEntries = 4,
): DashboardLog[] {
  return [...entries]
    .sort((left, right) => right.date.localeCompare(left.date))
    .slice(0, maxEntries)
    .map((entry) => ({
      id: entry.date,
      title: getEntryPrimaryLabel(entry),
      location: getEntryLocationLabel(entry),
      summary: getEntrySummary(entry),
      hours: entry.totalHours,
      dateLabel: formatEntryDateLabel(entry.date, referenceDate),
    }));
}

export function buildWeeklyOverview(
  entries: WorkEntry[],
  referenceDate: Date = new Date(),
): WeeklyPoint[] {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const hoursByDate = new Map<string, number>();

  for (const entry of entries) {
    hoursByDate.set(entry.date, (hoursByDate.get(entry.date) ?? 0) + entry.totalHours);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const dateKey = format(date, "yyyy-MM-dd");

    return {
      day: format(date, "EEE"),
      hours: hoursByDate.get(dateKey) ?? 0,
    };
  });
}

export function getHoursForDate(entries: WorkEntry[], dateKey: string): number {
  return entries.reduce(
    (total, entry) => (entry.date === dateKey ? total + entry.totalHours : total),
    0,
  );
}
