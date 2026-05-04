import { Box } from "@mui/material";
import { useCalendarData } from "../features/calendar/hooks/useCalendarData";
import { CalendarHeader } from "../features/calendar/components/CalendarHeader";
import { CalendarStats } from "../features/calendar/components/CalendarStats";
import { CalendarGrid } from "../features/calendar/components/CalendarGrid";
import { CalendarLegend } from "../features/calendar/components/CalendarLegend";

export default function Calendar() {
  const {
    visibleMonth,
    monthTotalHours,
    remoteHours,
    loggedDays,
    topProject,
    days,
    loadError,
    isLoading,
    goToPrevMonth,
    goToNextMonth,
    goToToday,
  } = useCalendarData();

  return (
    <Box>
      <CalendarHeader
        visibleMonth={visibleMonth}
        onPrev={goToPrevMonth}
        onNext={goToNextMonth}
        onToday={goToToday}
      />
      <CalendarStats
        monthTotalHours={monthTotalHours}
        remoteHours={remoteHours}
        loggedDays={loggedDays}
        topProject={topProject}
      />
      <CalendarGrid days={days} loadError={loadError} isLoading={isLoading} />
      <CalendarLegend />
    </Box>
  );
}
