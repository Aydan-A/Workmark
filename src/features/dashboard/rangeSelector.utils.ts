import { endOfWeek, format, startOfMonth, startOfWeek, subDays } from "date-fns";
import { parseDateKey } from "../entries/entry.utils";

export type SummaryTab = "today" | "this-week" | "last-7" | "this-month" | "custom";

export type DateRange = {
  start: string;
  end: string;
  label: string;
  humanLabel: string;
};

export function getBuiltinRange(
  tab: Exclude<SummaryTab, "custom">,
  referenceDate: Date,
): DateRange {
  const today = format(referenceDate, "yyyy-MM-dd");
  switch (tab) {
    case "today":
      return {
        start: today,
        end: today,
        label: "Today",
        humanLabel: format(referenceDate, "MMMM d, yyyy"),
      };
    case "this-week": {
      const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
      const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
      return {
        start: format(weekStart, "yyyy-MM-dd"),
        end: format(weekEnd, "yyyy-MM-dd"),
        label: "This week",
        humanLabel: `${format(weekStart, "MMM d")} – ${format(weekEnd, "MMM d, yyyy")}`,
      };
    }
    case "last-7": {
      const sevenBack = subDays(referenceDate, 6);
      return {
        start: format(sevenBack, "yyyy-MM-dd"),
        end: today,
        label: "In the last 7 days",
        humanLabel: `${format(sevenBack, "MMM d")} – ${format(referenceDate, "MMM d, yyyy")}`,
      };
    }
    case "this-month": {
      const monthStart = startOfMonth(referenceDate);
      return {
        start: format(monthStart, "yyyy-MM-dd"),
        end: today,
        label: "This month",
        humanLabel: format(monthStart, "MMMM yyyy"),
      };
    }
  }
}

export function getCustomHumanLabel(start: string, end: string): string {
  if (!start || !end) return "";
  return start === end
    ? format(parseDateKey(start), "MMMM d, yyyy")
    : `${format(parseDateKey(start), "MMM d")} – ${format(parseDateKey(end), "MMM d, yyyy")}`;
}
