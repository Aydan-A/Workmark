import { Alert, Box, Paper, Typography } from "@mui/material";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import type { DatesSetArg, EventClickArg, EventInput } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";

type Props = {
  loadError: string | null;
  calendarEvents: EventInput[];
  onDatesSet: (arg: DatesSetArg) => void;
  onDateClick: (arg: DateClickArg) => void;
  onEventClick: (arg: EventClickArg) => void;
};

const calendarPaperSx = {
  mt: 2,
  borderRadius: "24px",
  borderColor: "rgba(255,255,255,0.8)",
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
};

export function CalendarGrid({ loadError, calendarEvents, onDatesSet, onDateClick, onEventClick }: Props) {
  return (
    <Paper variant="outlined" sx={calendarPaperSx}>
      {loadError && <Alert severity="warning" sx={{ mb: 2 }}>{loadError}</Alert>}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{ left: "prev,next today", center: "title", right: "" }}
        events={calendarEvents}
        fixedWeekCount={false}
        showNonCurrentDates
        dayMaxEventRows={2}
        dateClick={onDateClick}
        eventClick={onEventClick}
        datesSet={onDatesSet}
        eventContent={(eventInfo) => (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, lineHeight: 1.1, color: "inherit" }}>
              {eventInfo.event.title}
            </Typography>
            <Typography variant="caption" sx={{ display: "block", lineHeight: 1.1, color: "rgba(255,255,255,0.9)" }}>
              {String(eventInfo.event.extendedProps.label ?? "")}
            </Typography>
          </Box>
        )}
      />
    </Paper>
  );
}
