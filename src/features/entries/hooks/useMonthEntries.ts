import { useEffect, useMemo, useState } from "react";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { useAuth } from "../../../hooks/useAuth";
import { getEntryLoadErrorMessage, subscribeToMonthEntries } from "../entry.api";
import { getEntryPrimaryLabel } from "../entry.utils";
import { formatHours } from "../../../utils/formatters";
import type { WorkEntry } from "../entry.types";

export function useMonthEntries() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [visibleMonth, setVisibleMonth] = useState<Date>(startOfMonth(new Date()));
  const [monthEntries, setMonthEntries] = useState<WorkEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setMonthEntries([]);
      setLoadError(null);
      return;
    }

    const unsubscribe = subscribeToMonthEntries(
      visibleMonth,
      (entries) => {
        setMonthEntries(entries);
        setLoadError(null);
      },
      (error) => {
        setLoadError(getEntryLoadErrorMessage(error));
      },
    );

    return unsubscribe;
  }, [user, visibleMonth]);

  const entriesByDate = useMemo(() => {
    const grouped = new Map<string, { totalHours: number; remoteHours: number; labels: Set<string> }>();

    for (const entry of monthEntries) {
      const current = grouped.get(entry.date) ?? { totalHours: 0, remoteHours: 0, labels: new Set<string>() };
      current.totalHours += entry.hours;
      if (entry.isRemote) current.remoteHours += entry.hours;
      current.labels.add(getEntryPrimaryLabel(entry));
      grouped.set(entry.date, current);
    }

    return grouped;
  }, [monthEntries]);

  const calendarEvents = useMemo<EventInput[]>(
    () =>
      Array.from(entriesByDate.entries()).map(([date, summary]) => ({
        id: date,
        title: `${formatHours(summary.totalHours)}h${summary.remoteHours > 0 ? ` · ${formatHours(summary.remoteHours)}r` : ""}`,
        start: date,
        allDay: true,
        backgroundColor: "#6366f1",
        borderColor: "#6366f1",
        textColor: "#ffffff",
        extendedProps: {
          label:
            summary.labels.size <= 1
              ? Array.from(summary.labels)[0] ?? "Uncategorized"
              : `${summary.labels.size} projects`,
        },
      })),
    [entriesByDate],
  );

  const monthEnd = endOfMonth(visibleMonth);
  const daysInMonth = format(monthEnd, "d");
  const daysLogged = entriesByDate.size;
  const totalHours = monthEntries.reduce((sum, item) => sum + item.hours, 0);
  const remoteHours = monthEntries.reduce((sum, item) => sum + (item.isRemote ? item.hours : 0), 0);

  const handleDatesSet = (arg: DatesSetArg) => {
    setVisibleMonth(startOfMonth(arg.view.currentStart));
  };

  const handleDateClick = (arg: DateClickArg) => {
    navigate(`/today?date=${arg.dateStr}`);
  };

  const handleEventClick = (arg: EventClickArg) => {
    const date = arg.event.startStr.slice(0, 10);
    navigate(`/today?date=${date}`);
  };

  return {
    loadError,
    calendarEvents,
    daysInMonth,
    daysLogged,
    totalHours,
    remoteHours,
    handleDatesSet,
    handleDateClick,
    handleEventClick,
  };
}
