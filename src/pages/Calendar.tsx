import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Paper, Stack, Typography } from "@mui/material";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import { useNavigate } from "react-router-dom";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { useAuth } from "../hooks/useAuth";
import { getEntryLoadErrorMessage, subscribeToMonthEntries } from "../features/entries/entry.api";
import type { WorkEntry } from "../features/entries/entry.types";
import { getEntryPrimaryLabel } from "../features/entries/entry.utils";

function formatHours(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

export default function Calendar() {
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

  const calendarEvents = useMemo<EventInput[]>(
    () =>
      monthEntries.map((entry) => ({
        id: entry.date,
        title: `${formatHours(entry.totalHours)}h${entry.remoteHours > 0 ? ` · ${formatHours(entry.remoteHours)}r` : ""}`,
        start: entry.date,
        allDay: true,
        backgroundColor: "#6366f1",
        borderColor: "#6366f1",
        textColor: "#ffffff",
        extendedProps: {
          label: getEntryPrimaryLabel(entry),
          hasAttachment: (entry.receiptFileNames?.length ?? 0) > 0,
        },
      })),
    [monthEntries],
  );

  const monthEnd = endOfMonth(visibleMonth);
  const daysInMonth = format(monthEnd, "d");
  const daysLogged = monthEntries.length;
  const totalHours = monthEntries.reduce((sum, item) => sum + item.totalHours, 0);
  const remoteHours = monthEntries.reduce((sum, item) => sum + item.remoteHours, 0);

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

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#6b7280" }}>
            Logged days
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.25 }}>
            {daysLogged}{" "}
            <Typography component="span" variant="body2" sx={{ color: "#6b7280" }}>
              / {daysInMonth}
            </Typography>
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#6b7280" }}>
            Total hours
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.25 }}>
            {formatHours(totalHours)}h
          </Typography>
        </Paper>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#6b7280" }}>
            Remote hours
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.25 }}>
            {formatHours(remoteHours)}h
          </Typography>
        </Paper>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          mt: 2,
          borderRadius: 3,
          p: 2,
          "& .fc": { fontFamily: "inherit" },
          "& .fc .fc-toolbar.fc-header-toolbar": { mb: 1.5 },
          "& .fc .fc-toolbar-title": { fontSize: "1.4rem", fontWeight: 700, color: "#111827" },
          "& .fc .fc-button": {
            borderRadius: 2,
            textTransform: "none",
            borderColor: "#d1d5db",
            backgroundColor: "white",
            color: "#111827",
            boxShadow: "none",
          },
          "& .fc .fc-button:hover": { backgroundColor: "#f3f4f6" },
          "& .fc .fc-daygrid-day-number": { color: "#475569", fontWeight: 600 },
          "& .fc .fc-col-header-cell-cushion": { color: "#94a3b8", fontWeight: 700, textDecoration: "none" },
          "& .fc .fc-day-today": { backgroundColor: "rgba(79, 70, 229, 0.06)" },
          "& .fc .fc-event": { borderRadius: 8, padding: "2px 6px" },
        }}
      >
        {loadError && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            {loadError}
          </Alert>
        )}

        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
          events={calendarEvents}
          fixedWeekCount={false}
          showNonCurrentDates
          dayMaxEventRows={2}
          dateClick={handleDateClick}
          eventClick={handleEventClick}
          datesSet={handleDatesSet}
          eventContent={(eventInfo) => (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.1, color: "inherit" }}>
                {eventInfo.event.title}
              </Typography>
              <Typography
                variant="caption"
                sx={{ display: "block", lineHeight: 1.1, color: "rgba(255,255,255,0.9)" }}
              >
                {String(eventInfo.event.extendedProps.label ?? "")}
              </Typography>
            </Box>
          )}
        />
      </Paper>
    </Box>
  );
}
