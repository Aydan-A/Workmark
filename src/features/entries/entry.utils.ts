import {
  addDays,
  differenceInCalendarDays,
  format,
  parse,
  startOfDay,
  startOfWeek,
} from "date-fns";
import type {
  CompactDailyBreakdownRow,
  DashboardLog,
  WeeklyBusiestDay,
  WeeklyPoint,
  WeeklyTopProject,
  WorkEntry,
} from "./entry.types";

function parseDateKey(dateKey: string): Date {
  return parse(dateKey, "yyyy-MM-dd", new Date());
}

export function getEntryPrimaryLabel(entry: WorkEntry): string {
  return entry.projectName?.trim() || "Uncategorized";
}

export function getEntryLocationLabel(entry: WorkEntry): string {
  return entry.isRemote ? "Remote" : "Office";
}

export function getEntrySummary(entry: WorkEntry): string {
  return entry.note?.trim() ?? "";
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
    .sort((left, right) => {
      if (left.date !== right.date) {
        return right.date.localeCompare(left.date);
      }

      return right.startTime.localeCompare(left.startTime);
    })
    .slice(0, maxEntries)
    .map((entry) => ({
      id: entry.id,
      title: getEntryPrimaryLabel(entry),
      location: getEntryLocationLabel(entry),
      summary: getEntrySummary(entry),
      hours: entry.hours,
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
    hoursByDate.set(entry.date, (hoursByDate.get(entry.date) ?? 0) + entry.hours);
  }

  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const dateKey = format(date, "yyyy-MM-dd");

    return {
      dateKey,
      day: format(date, "EEE"),
      dateLabel: format(date, "MMM d"),
      hours: hoursByDate.get(dateKey) ?? 0,
      isToday: dateKey === format(referenceDate, "yyyy-MM-dd"),
    };
  });
}

export function getHoursForDate(entries: WorkEntry[], dateKey: string): number {
  return entries.reduce(
    (total, entry) => (entry.date === dateKey ? total + entry.hours : total),
    0,
  );
}

export function getTotalRemoteHours(entries: WorkEntry[]): number {
  return entries.reduce(
    (total, entry) => (entry.isRemote ? total + entry.hours : total),
    0,
  );
}

export function countLoggedDays(entries: WorkEntry[]): number {
  return new Set(
    entries
      .filter((entry) => entry.hours > 0)
      .map((entry) => entry.date),
  ).size;
}

export function calculateAverageHours(entries: WorkEntry[]): number {
  if (entries.length === 0) return 0;

  const loggedDays = countLoggedDays(entries);
  if (loggedDays === 0) return 0;

  const totalHours = entries.reduce((total, entry) => total + entry.hours, 0);
  return totalHours / loggedDays;
}

export function findBusiestDay(entries: WorkEntry[]): WeeklyBusiestDay | null {
  const hoursByDate = new Map<string, number>();

  for (const entry of entries) {
    hoursByDate.set(entry.date, (hoursByDate.get(entry.date) ?? 0) + entry.hours);
  }

  let busiest: WeeklyBusiestDay | null = null;

  for (const [date, hours] of hoursByDate.entries()) {
    if (hours <= 0) continue;

    if (!busiest || hours > busiest.hours || (hours === busiest.hours && date < busiest.date)) {
      busiest = {
        date,
        day: format(parseDateKey(date), "EEE"),
        hours,
      };
    }
  }

  return busiest;
}

export function findTopProject(entries: WorkEntry[]): WeeklyTopProject | null {
  const projectTotals = new Map<string, { hours: number; dates: Set<string> }>();

  for (const entry of entries) {
    const projectName = getEntryPrimaryLabel(entry);
    const current = projectTotals.get(projectName) ?? { hours: 0, dates: new Set<string>() };

    current.hours += entry.hours;
    current.dates.add(entry.date);
    projectTotals.set(projectName, current);
  }

  let topProject: WeeklyTopProject | null = null;

  for (const [name, data] of projectTotals.entries()) {
    if (data.hours <= 0) continue;

    if (
      !topProject ||
      data.hours > topProject.hours ||
      (data.hours === topProject.hours && data.dates.size > topProject.days) ||
      (data.hours === topProject.hours && data.dates.size === topProject.days && name < topProject.name)
    ) {
      topProject = {
        name,
        hours: data.hours,
        days: data.dates.size,
      };
    }
  }

  return topProject;
}

export function getSafeReceiptCountTotal(_entries: WorkEntry[]): number {
  return 0;
}

export function buildCompactDailyBreakdownRows(entries: WorkEntry[]): CompactDailyBreakdownRow[] {
  const entriesByDate = new Map<string, WorkEntry[]>();

  for (const entry of entries) {
    const currentEntries = entriesByDate.get(entry.date) ?? [];
    currentEntries.push(entry);
    entriesByDate.set(entry.date, currentEntries);
  }

  return Array.from(entriesByDate.entries())
    .sort(([leftDate], [rightDate]) => leftDate.localeCompare(rightDate))
    .map(([date, dateEntries]) => {
      const dateObject = parseDateKey(date);
      const uniqueProjects = Array.from(
        new Set(dateEntries.map((entry) => getEntryPrimaryLabel(entry))),
      );
      const projectLabel =
        uniqueProjects.length <= 1
          ? (uniqueProjects[0] ?? "Uncategorized")
          : `${uniqueProjects.length} projects`;

      return {
        date,
        day: format(dateObject, "EEE"),
        dateLabel: format(dateObject, "MMM d"),
        hours: dateEntries.reduce((total, entry) => total + entry.hours, 0),
        projectLabel,
        receiptCount: 0,
      };
    });
}

export function buildProjectId(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "general";
}

export function buildTimeRangeFromHours(hours: number): { startTime: string; endTime: string } {
  if (!Number.isFinite(hours) || hours <= 0 || hours >= 24) {
    throw new Error("Hours must be greater than 0 and less than 24.");
  }
  const totalMinutes = Math.round(hours * 60);
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  return {
    startTime: "00:00",
    endTime: `${String(endHours).padStart(2, "0")}:${String(endMinutes).padStart(2, "0")}`,
  };
}
