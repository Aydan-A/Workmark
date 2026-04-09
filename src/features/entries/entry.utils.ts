import {
  addDays,
  differenceInCalendarDays,
  format,
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

export function getTotalRemoteHours(entries: WorkEntry[]): number {
  return entries.reduce((total, entry) => total + Math.max(entry.remoteHours, 0), 0);
}

export function countLoggedDays(entries: WorkEntry[]): number {
  return new Set(
    entries
      .filter((entry) => entry.remoteHours > 0)
      .map((entry) => entry.date),
  ).size;
}

export function calculateAverageHours(entries: WorkEntry[]): number {
  const loggedDays = countLoggedDays(entries);
  if (loggedDays === 0) return 0;
  return getTotalRemoteHours(entries) / loggedDays;
}

export function findBusiestDay(entries: WorkEntry[]): WeeklyBusiestDay | null {
  const hoursByDate = new Map<string, number>();

  for (const entry of entries) {
    hoursByDate.set(entry.date, (hoursByDate.get(entry.date) ?? 0) + Math.max(entry.remoteHours, 0));
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

    current.hours += Math.max(entry.remoteHours, 0);
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

export function getSafeReceiptCountTotal(entries: WorkEntry[]): number {
  return entries.reduce((total, entry) => {
    const receiptCount = Array.isArray(entry.receiptFileNames) ? entry.receiptFileNames.length : 0;
    return total + receiptCount;
  }, 0);
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
          ? (uniqueProjects[0] ?? "No project")
          : `${uniqueProjects.length} projects`;

      return {
        date,
        day: format(dateObject, "EEE"),
        dateLabel: format(dateObject, "MMM d"),
        hours: getTotalRemoteHours(dateEntries),
        projectLabel,
        receiptCount: getSafeReceiptCountTotal(dateEntries),
      };
    });
}
