import { useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import FileDownloadOutlinedIcon from "@mui/icons-material/FileDownloadOutlined";
import {
  addDays,
  addMonths,
  endOfDay,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameMonth,
  isToday,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
type Entry = {
  date: string;
  totalHours: number;
  remoteHours: number;
  label: string;
  hasAttachment?: boolean;
};

const weekdayLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const entries: Entry[] = [];

function formatHours(value: number): string {
  return Number.isInteger(value) ? `${value}` : `${value.toFixed(1)}`;
}

export default function Calendar() {
  const initialMonth = useMemo(() => startOfMonth(new Date()), []);
  const [visibleMonth, setVisibleMonth] = useState<Date>(initialMonth);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const monthDays = useMemo(() => {
    const gridStart = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
    const gridEnd = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
    const days: Date[] = [];

    for (let cursor = gridStart; !isAfter(cursor, gridEnd); cursor = addDays(cursor, 1)) {
      days.push(cursor);
    }

    return days;
  }, [visibleMonth]);

  const entriesByDate = useMemo(() => {
    const map = new Map<string, Entry>();
    entries.forEach((entry) => map.set(entry.date, entry));
    return map;
  }, []);

  const monthStart = startOfMonth(visibleMonth);
  const monthEnd = endOfMonth(visibleMonth);

  const monthEntries = useMemo(
    () =>
      entries.filter((entry) => {
        const entryDate = new Date(entry.date);
        return !isBefore(entryDate, startOfDay(monthStart)) && !isAfter(entryDate, endOfDay(monthEnd));
      }),
    [monthStart, monthEnd],
  );
  const daysInMonth = format(monthEnd, "d");
  const daysLogged = monthEntries.length;
  const totalHours = monthEntries.reduce((sum, item) => sum + item.totalHours, 0);
  const remoteHours = monthEntries.reduce((sum, item) => sum + item.remoteHours, 0);

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

        <Button variant="contained" startIcon={<FileDownloadOutlinedIcon />} sx={{ minWidth: 144 }}>
          Export CSV
        </Button>
      </Stack>

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
        <Paper variant="outlined" sx={{ p: 2.25, borderRadius: 2.5, flex: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#6b7280" }}>
            Logged days
          </Typography>
          <Typography variant="h4" sx={{ mt: 0.25 }}>
            {daysLogged} <Typography component="span" variant="body2" sx={{ color: "#6b7280" }}>/ {daysInMonth}</Typography>
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

      <Paper variant="outlined" sx={{ mt: 2, borderRadius: 3, overflow: "hidden" }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2.5, py: 1.75, borderBottom: "1px solid #e5e7eb" }}
        >
          <IconButton size="small" onClick={() => setVisibleMonth((current) => addMonths(current, -1))}>
            <ChevronLeftIcon />
          </IconButton>

          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h3" sx={{ fontWeight: 700 }}>
              {format(visibleMonth, "MMMM yyyy")}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setVisibleMonth(startOfMonth(new Date()));
                setSelectedDate(new Date());
              }}
              sx={{ px: 1.25, minWidth: 0, borderRadius: 999 }}
            >
              Today
            </Button>
          </Stack>

          <IconButton size="small" onClick={() => setVisibleMonth((current) => addMonths(current, 1))}>
            <ChevronRightIcon />
          </IconButton>
        </Stack>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", borderBottom: "1px solid #eef2f7" }}>
          {weekdayLabels.map((day) => (
            <Typography
              key={day}
              variant="subtitle2"
              align="center"
              sx={{ py: 1.1, color: "#94a3b8", borderRight: "1px solid #f1f5f9", "&:last-of-type": { borderRight: 0 } }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))" }}>
          {monthDays.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const entry = entriesByDate.get(key);
            const inCurrentMonth = isSameMonth(day, visibleMonth);
            const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");

            return (
              <Box
                key={key}
                onClick={() => setSelectedDate(day)}
                sx={{
                  minHeight: 90,
                  p: 1,
                  cursor: "pointer",
                  borderRight: "1px solid #f1f5f9",
                  borderBottom: "1px solid #f1f5f9",
                  bgcolor: inCurrentMonth ? "white" : "#fafafa",
                  "&:hover": { bgcolor: "#f8fafc" },
                  "&:nth-of-type(7n)": { borderRight: 0 },
                }}
              >
                <Box
                  sx={{
                    width: 28,
                    height: 28,
                    borderRadius: 999,
                    display: "grid",
                    placeItems: "center",
                    fontSize: 14,
                    fontWeight: 700,
                    color: inCurrentMonth ? "#111827" : "#cbd5e1",
                    bgcolor: isSelected ? "#4f46e5" : "transparent",
                    border: isToday(day) ? "1px solid #4f46e5" : "1px solid transparent",
                  }}
                >
                  <Typography variant="caption" sx={{ color: isSelected ? "white" : "inherit", fontWeight: 700 }}>
                    {format(day, "d")}
                  </Typography>
                </Box>

                {entry && (
                  <Box sx={{ mt: 1 }}>
                    <Box
                      sx={{
                        borderRadius: 999,
                        px: 1,
                        py: 0.25,
                        bgcolor: "#6366f1",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 700,
                        width: "fit-content",
                      }}
                    >
                      {formatHours(entry.totalHours)}h{entry.remoteHours > 0 ? ` · ${formatHours(entry.remoteHours)}r` : ""}
                    </Box>
                    <Typography variant="caption" sx={{ color: "#94a3b8", mt: 0.4, display: "block" }}>
                      {entry.label}
                    </Typography>
                    {entry.hasAttachment && (
                      <Box sx={{ mt: 0.4, display: "flex", alignItems: "center", gap: 0.5 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: 999, bgcolor: "#f59e0b" }} />
                        <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                          Attachment
                        </Typography>
                      </Box>
                    )}
                  </Box>
                )}
              </Box>
            );
          })}
        </Box>

        <Stack direction="row" spacing={2} sx={{ px: 2.5, py: 1.5, borderTop: "1px solid #e5e7eb", flexWrap: "wrap", rowGap: 1 }}>
          <Typography variant="subtitle2" sx={{ color: "#64748b" }}>
            Hours logged:
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: "#e0e7ff" }} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              1-3h
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: "#a5b4fc" }} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              4-5h
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: "#6366f1" }} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              6-7h
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: "#4f46e5" }} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              8h+
            </Typography>
          </Stack>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box sx={{ width: 12, height: 12, borderRadius: 999, bgcolor: "#f59e0b" }} />
            <Typography variant="body2" sx={{ color: "#64748b" }}>
              Has attachments
            </Typography>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
