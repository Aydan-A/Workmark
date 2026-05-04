import { useMemo } from "react";
import { differenceInCalendarDays, format } from "date-fns";
import type { WorkEntry } from "../../entries/entry.types";
import { formatHours, parseDateKey } from "../../entries/entry.utils";
import type { ProjectBreakdown } from "../summary.utils";

export type SummaryStats = {
  totalHours: number;
  formattedTotalHours: string;
  projectCount: number;
  avgHoursPerDay: number;
  topProject: { name: string; hours: number } | null;
  busiestDay: { label: string; hours: number } | null;
  projectBreakdowns: ProjectBreakdown[];
};

export function useSummaryData(
  entries: WorkEntry[],
  startDate: string,
  endDate: string,
): SummaryStats {
  return useMemo(() => {
    const rangeEntries = entries.filter(
      (e) => e.date >= startDate && e.date <= endDate,
    );

    const totalHours = rangeEntries.reduce((sum, e) => sum + e.hours, 0);

    const dayCount = Math.max(
      1,
      differenceInCalendarDays(parseDateKey(endDate), parseDateKey(startDate)) + 1,
    );
    const avgHoursPerDay = totalHours / dayCount;

    // Per-project breakdown: collect hours and notes per project
    const projectMap = new Map<
      string,
      { name: string; hours: number; notes: string[] }
    >();
    for (const e of rangeEntries) {
      const existing = projectMap.get(e.projectId) ?? {
        name: e.projectName,
        hours: 0,
        notes: [],
      };
      existing.hours += e.hours;
      if (e.note?.trim()) existing.notes.push(e.note.trim());
      projectMap.set(e.projectId, existing);
    }

    const projectBreakdowns: ProjectBreakdown[] = [...projectMap.values()]
      .filter((p) => p.hours > 0)
      .sort((a, b) => b.hours - a.hours)
      .map((p) => ({
        name: p.name,
        hours: p.hours,
        formattedHours: formatHours(p.hours),
        notes: p.notes,
      }));

    const topProject = projectBreakdowns[0] ?? null;

    const dayTotals = new Map<string, number>();
    for (const e of rangeEntries) {
      dayTotals.set(e.date, (dayTotals.get(e.date) ?? 0) + e.hours);
    }
    let busiestDay: { label: string; hours: number } | null = null;
    for (const [date, hours] of dayTotals.entries()) {
      if (!busiestDay || hours > busiestDay.hours) {
        busiestDay = { label: format(parseDateKey(date), "EEEE"), hours };
      }
    }

    return {
      totalHours,
      formattedTotalHours: formatHours(totalHours),
      projectCount: projectBreakdowns.length,
      avgHoursPerDay,
      topProject,
      busiestDay,
      projectBreakdowns,
    };
  }, [entries, startDate, endDate]);
}
