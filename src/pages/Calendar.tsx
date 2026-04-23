import { Box, Button, Stack, Typography } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useMonthEntries } from "../features/entries/hooks/useMonthEntries";
import { CalendarStats } from "../features/entries/components/CalendarStats";
import { CalendarGrid } from "../features/entries/components/CalendarGrid";

export default function Calendar() {
  const {
    loadError,
    calendarEvents,
    daysInMonth,
    daysLogged,
    totalHours,
    remoteHours,
    handleDatesSet,
    handleDateClick,
    handleEventClick,
  } = useMonthEntries();

  return (
    <Box>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        spacing={2}
      >
        <Box>
          <Typography variant="h2">Calendar</Typography>
          <Typography variant="body2" sx={{ color: "#6b7280", mt: 0.5 }}>
            Click any day to view or log an entry
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} sx={{ minWidth: 144 }} disabled>
          Export CSV
        </Button>
      </Stack>

      <CalendarStats
        daysLogged={daysLogged}
        daysInMonth={daysInMonth}
        totalHours={totalHours}
        remoteHours={remoteHours}
      />

      <CalendarGrid
        loadError={loadError}
        calendarEvents={calendarEvents}
        onDatesSet={handleDatesSet}
        onDateClick={handleDateClick}
        onEventClick={handleEventClick}
      />
    </Box>
  );
}
