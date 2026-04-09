import { useState } from "react";
import { Box, Button, Chip, Paper, Stack, TextField, Typography } from "@mui/material";
import { endOfWeek, format, startOfWeek } from "date-fns";

function buildMetricPlaceholder(label: string, value: string) {
  return { label, value };
}

const placeholderMetrics = [
  buildMetricPlaceholder("Total remote hours", "0.0 hrs"),
  buildMetricPlaceholder("Days logged", "0 days"),
  buildMetricPlaceholder("Average hours", "0.0 hrs"),
  buildMetricPlaceholder("Busiest day", "No entries yet"),
  buildMetricPlaceholder("Top project", "No project yet"),
];

const placeholderDays = [
  { day: "Mon", note: "No log yet" },
  { day: "Tue", note: "No log yet" },
  { day: "Wed", note: "No log yet" },
  { day: "Thu", note: "No log yet" },
  { day: "Fri", note: "No log yet" },
  { day: "Sat", note: "No log yet" },
  { day: "Sun", note: "No log yet" },
];

export default function WeeklyLog() {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const currentWeekStartKey = format(weekStart, "yyyy-MM-dd");
  const currentWeekEndKey = format(weekEnd, "yyyy-MM-dd");
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStartKey);
  const [selectedWeekEnd, setSelectedWeekEnd] = useState(currentWeekEndKey);

  const selectedStartDate = new Date(`${selectedWeekStart}T00:00:00`);
  const selectedEndDate = new Date(`${selectedWeekEnd}T00:00:00`);
  const weekRangeLabel =
    Number.isNaN(selectedStartDate.getTime()) || Number.isNaN(selectedEndDate.getTime())
      ? "Pick a week"
      : `${format(selectedStartDate, "MMM d")} - ${format(selectedEndDate, "MMM d, yyyy")}`;
  const isCurrentWeek =
    selectedWeekStart === currentWeekStartKey && selectedWeekEnd === currentWeekEndKey;

  return (
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Stack spacing={2.5}>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 4,
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(247,245,255,0.98) 100%)",
          }}
        >
          <Box sx={{ p: { xs: 2.25, sm: 2.75 } }}>
            <Stack spacing={2}>
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  variant="h3"
                  sx={{ fontSize: { xs: "1.2rem", sm: "1.3rem" }, letterSpacing: "-0.02em" }}
                >
                  Select a Custom Week
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", mt: 0.6, fontSize: { xs: "0.95rem", sm: "0.98rem" } }}
                >
                  Choose a start and end date to preview a different weekly range.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1.5}
                justifyContent="center"
                alignItems="stretch"
              >
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.7,
                      px: 0.25,
                      color: "#6b7280",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                    }}
                  >
                    Week start
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    value={selectedWeekStart}
                    onChange={(event) => setSelectedWeekStart(event.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.88)",
                        minHeight: 58,
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.98rem", sm: "1rem" },
                        letterSpacing: "-0.01em",
                        py: 1.9,
                      },
                    }}
                  />
                </Box>
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      mb: 0.7,
                      px: 0.25,
                      color: "#6b7280",
                      fontSize: "0.84rem",
                      fontWeight: 600,
                    }}
                  >
                    Week end
                  </Typography>
                  <TextField
                    fullWidth
                    type="date"
                    value={selectedWeekEnd}
                    onChange={(event) => setSelectedWeekEnd(event.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: "rgba(255,255,255,0.88)",
                        minHeight: 58,
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.98rem", sm: "1rem" },
                        letterSpacing: "-0.01em",
                        py: 1.9,
                      },
                    }}
                  />
                </Box>
              </Stack>

              <Stack direction="column" spacing={1} alignItems="center">
                <Chip
                  label={isCurrentWeek ? `Current week: ${weekRangeLabel}` : `Selected week: ${weekRangeLabel}`}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "rgba(99, 102, 241, 0.08)",
                    color: "#4338ca",
                    border: "1px solid rgba(99, 102, 241, 0.12)",
                    fontWeight: 600,
                    fontSize: "0.92rem",
                  }}
                />
                <Button
                  variant="text"
                  onClick={() => {
                    setSelectedWeekStart(currentWeekStartKey);
                    setSelectedWeekEnd(currentWeekEndKey);
                  }}
                  sx={{
                    textTransform: "none",
                    fontWeight: 600,
                    color: "#5b55d6",
                    minHeight: "auto",
                    px: 1,
                    py: 0.25,
                  }}
                >
                  Reset to current week
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(248,246,255,0.98) 100%)",
          }}
        >
          <Box sx={{ p: { xs: 2.25, sm: 3 } }}>
            <Stack spacing={2.5}>
              <Stack
                direction="column"
                spacing={1.25}
                justifyContent="center"
                alignItems="center"
                sx={{ textAlign: "center" }}
              >
                <Box>
                  <Typography
                    variant="h3"
                    sx={{ fontSize: { xs: "1.55rem", sm: "1.7rem" }, letterSpacing: "-0.02em" }}
                  >
                    Weekly Summary
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#6b7280", mt: 0.6, fontSize: { xs: "0.95rem", sm: "0.98rem" } }}
                  >
                    {isCurrentWeek ? "Current week" : "Selected week"}
                  </Typography>
                </Box>

                <Chip
                  label={weekRangeLabel}
                  sx={{
                    borderRadius: 999,
                    bgcolor: "rgba(99, 102, 241, 0.08)",
                    color: "#4338ca",
                    border: "1px solid rgba(99, 102, 241, 0.12)",
                    fontWeight: 600,
                    fontSize: "0.92rem",
                  }}
                />
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "1fr",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(5, minmax(0, 1fr))",
                  },
                  gap: 1.5,
                }}
              >
                {placeholderMetrics.map((metric) => (
                  <Paper
                    key={metric.label}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      borderColor: "rgba(124, 106, 214, 0.14)",
                      backgroundColor: "rgba(255,255,255,0.82)",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      sx={{ color: "#667085", mb: 0.75, fontSize: "0.95rem" }}
                    >
                      {metric.label}
                    </Typography>
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: { xs: "1.05rem", sm: "1.18rem", lg: "1.35rem" },
                        lineHeight: 1.18,
                        letterSpacing: "-0.02em",
                        maxWidth: "8ch",
                        mx: "auto",
                        textWrap: "balance",
                      }}
                    >
                      {metric.value}
                    </Typography>
                  </Paper>
                ))}
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.1fr) minmax(0, 0.9fr)" },
                  gap: 1.75,
                }}
              >
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    borderColor: "rgba(124, 106, 214, 0.14)",
                    backgroundColor: "rgba(255,255,255,0.8)",
                    minHeight: 172,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.18rem" }, mb: 1.1, textAlign: "center" }}
                  >
                    Weekly Recap
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#64748b", lineHeight: 1.7, fontSize: "0.98rem", textAlign: "center" }}
                  >
                    Weekly recap will appear here.
                  </Typography>
                </Paper>

                <Paper
                  variant="outlined"
                  sx={{
                    p: 2.25,
                    borderRadius: 3,
                    borderColor: "rgba(124, 106, 214, 0.14)",
                    backgroundColor: "rgba(255,255,255,0.8)",
                    minHeight: 172,
                  }}
                >
                  <Typography
                    variant="h3"
                    sx={{ fontSize: { xs: "1.1rem", sm: "1.18rem" }, mb: 1.1, textAlign: "center" }}
                  >
                    Daily Breakdown
                  </Typography>
                  <Stack spacing={1}>
                    {placeholderDays.map((item) => (
                      <Box
                        key={item.day}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: 2,
                          px: 1.25,
                          py: 1,
                          borderRadius: 2.5,
                          bgcolor: "rgba(99, 102, 241, 0.05)",
                        }}
                      >
                        <Typography variant="subtitle2" sx={{ color: "#1f2340" }}>
                          {item.day}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                          {item.note}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                </Paper>
              </Box>
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
