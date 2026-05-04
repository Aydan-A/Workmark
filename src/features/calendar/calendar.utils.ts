import {
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from "date-fns";

export type CalendarDay = {
  date: Date;
  dateKey: string;
  hours: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  bucket: 0 | 1 | 2 | 3;
};

export function getHoursBucket(hours: number): 0 | 1 | 2 | 3 {
  if (hours <= 0) return 0;
  if (hours <= 3) return 1;
  if (hours <= 6) return 2;
  return 3;
}

export function buildCalendarDays(
  visibleMonth: Date,
  hoursByDate: Map<string, number>,
): CalendarDay[] {
  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

  return eachDayOfInterval({ start: gridStart, end: gridEnd }).map((date) => {
    const dateKey = format(date, "yyyy-MM-dd");
    const hours = hoursByDate.get(dateKey) ?? 0;
    return {
      date,
      dateKey,
      hours,
      isCurrentMonth: isSameMonth(date, visibleMonth),
      isToday: isToday(date),
      bucket: getHoursBucket(hours),
    };
  });
}
