import { useEffect, useMemo, useState } from "react";
import { Alert, Box, Button, Chip, Paper, Skeleton, Stack, TextField, Typography } from "@mui/material";
import { addDays, differenceInCalendarDays, endOfWeek, format, startOfWeek } from "date-fns";
import { Link as RouterLink } from "react-router-dom";
import {
  getEntryLoadErrorMessage,
  subscribeToEntries,
} from "../features/entries/entry.api";
import type { WorkEntry } from "../features/entries/entry.types";
import {
  buildCompactDailyBreakdownRows,
  calculateAverageHours,
  countLoggedDays,
  findBusiestDay,
  findTopProject,
  getSafeReceiptCountTotal,
  getTotalRemoteHours,
} from "../features/entries/entry.utils";
import { useAuth } from "../hooks/useAuth";

function formatHours(value: number): string {
  return Number.isInteger(value) ? `${value}` : value.toFixed(1);
}

function buildWeekRangeLabel(startDate: Date, endDate: Date): string {
  return `${format(startDate, "MMM d")} - ${format(endDate, "MMM d, yyyy")}`;
}

export default function WeeklyLog() {
  const { user } = useAuth();
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 });
  const currentWeekStartKey = format(weekStart, "yyyy-MM-dd");
  const currentWeekEndKey = format(weekEnd, "yyyy-MM-dd");
  const [selectedWeekStart, setSelectedWeekStart] = useState(currentWeekStartKey);
  const [selectedWeekEnd, setSelectedWeekEnd] = useState(currentWeekEndKey);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const selectedStartDate = useMemo(
    () => new Date(`${selectedWeekStart}T00:00:00`),
    [selectedWeekStart],
  );
  const selectedEndDate = useMemo(
    () => new Date(`${selectedWeekEnd}T00:00:00`),
    [selectedWeekEnd],
  );
  const isDateRangeValid =
    !Number.isNaN(selectedStartDate.getTime()) &&
    !Number.isNaN(selectedEndDate.getTime()) &&
    selectedStartDate <= selectedEndDate;
  const weekRangeLabel = isDateRangeValid
    ? buildWeekRangeLabel(selectedStartDate, selectedEndDate)
    : "Pick a valid week";
  const isCurrentWeek =
    selectedWeekStart === currentWeekStartKey && selectedWeekEnd === currentWeekEndKey;
  const hasLoadError = Boolean(loadError) && isDateRangeValid && !isLoading;
  const isEmptyWeek = isDateRangeValid && !isLoading && !loadError && entries.length === 0;
  const hasWeeklyData = isDateRangeValid && !isLoading && !loadError && entries.length > 0;

  useEffect(() => {
    if (!user || !isDateRangeValid) {
      setEntries([]);
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const unsubscribe = subscribeToEntries(
      (nextEntries) => {
        setEntries(nextEntries);
        setLoadError(null);
        setIsLoading(false);
      },
      (error) => {
        setEntries([]);
        setLoadError(getEntryLoadErrorMessage(error));
        setIsLoading(false);
      },
      {
        startDate: selectedWeekStart,
        endDate: selectedWeekEnd,
        orderDirection: "asc",
      },
    );

    return unsubscribe;
  }, [isDateRangeValid, selectedWeekEnd, selectedWeekStart, user]);

  const totalRemoteHours = useMemo(() => getTotalRemoteHours(entries), [entries]);
  const loggedDays = useMemo(() => countLoggedDays(entries), [entries]);
  const averageHours = useMemo(() => calculateAverageHours(entries), [entries]);
  const busiestDay = useMemo(() => findBusiestDay(entries), [entries]);
  const topProject = useMemo(() => findTopProject(entries), [entries]);
  const receiptCountTotal = useMemo(() => getSafeReceiptCountTotal(entries), [entries]);
  const breakdownRows = useMemo(() => buildCompactDailyBreakdownRows(entries), [entries]);

  const visibleBreakdownRows = useMemo(() => {
    if (!isDateRangeValid) return [];

    const rowMap = new Map(breakdownRows.map((row) => [row.date, row]));
    const dayCount = differenceInCalendarDays(selectedEndDate, selectedStartDate) + 1;

    return Array.from({ length: Math.max(dayCount, 0) }, (_, index) => {
      const date = addDays(selectedStartDate, index);
      const dateKey = format(date, "yyyy-MM-dd");
      const existingRow = rowMap.get(dateKey);

      if (existingRow) return existingRow;

      return {
        date: dateKey,
        day: format(date, "EEE"),
        dateLabel: format(date, "MMM d"),
        hours: 0,
        projectLabel: "No project yet",
        receiptCount: 0,
      };
    });
  }, [breakdownRows, isDateRangeValid, selectedEndDate, selectedStartDate]);

  const summaryMetrics = [
    {
      label: "Total remote hours",
      value: isLoading ? "Loading..." : `${formatHours(totalRemoteHours)} hrs`,
    },
    {
      label: "Days logged",
      value: isLoading ? "Loading..." : `${loggedDays} ${loggedDays === 1 ? "day" : "days"}`,
    },
    {
      label: "Average hours",
      value: isLoading ? "Loading..." : `${formatHours(averageHours)} hrs`,
    },
    {
      label: "Busiest day",
      value: isLoading
        ? "Loading..."
        : busiestDay
          ? `${busiestDay.day} · ${formatHours(busiestDay.hours)} hrs`
          : "No entries yet",
    },
    {
      label: "Top project",
      value: isLoading ? "Loading..." : topProject?.name ?? "No project yet",
    },
  ];

  const recapText = useMemo(() => {
    if (!user) return "Sign in to see your weekly summary.";
    if (!isDateRangeValid) return "Choose a valid start and end date to load a weekly summary.";
    if (isLoading) return "Loading your weekly summary.";
    if (loadError) return loadError;
    if (entries.length === 0) return "No entries saved for this range yet.";

    const projectText = topProject ? ` Top project: ${topProject.name}.` : "";
    const receiptText =
      receiptCountTotal > 0 ? ` ${receiptCountTotal} receipt${receiptCountTotal === 1 ? "" : "s"} attached.` : "";

    return `You logged ${formatHours(totalRemoteHours)} remote hours across ${loggedDays} ${
      loggedDays === 1 ? "day" : "days"
    }. Average: ${formatHours(averageHours)} hrs per logged day.${projectText}${receiptText}`;
  }, [
    averageHours,
    entries.length,
    isDateRangeValid,
    isLoading,
    loadError,
    loggedDays,
    receiptCountTotal,
    topProject,
    totalRemoteHours,
    user,
  ]);

  return (
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Stack spacing={2.5}>
        <Box sx={{ textAlign: "center", maxWidth: 640, mx: "auto" }}>
        </Box>

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

              {!isDateRangeValid ? (
                <Alert severity="warning">Pick a week end date that is on or after the week start date.</Alert>
              ) : null}

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

              {isLoading ? (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(5, minmax(0, 1fr))",
                      },
                      gap: 1.15,
                    }}
                  >
                    {Array.from({ length: 5 }, (_, index) => (
                      <Paper
                        key={`loading-metric-${index}`}
                        variant="outlined"
                        sx={{
                          p: { xs: 1.5, sm: 1.65 },
                          borderRadius: 2.5,
                          borderColor: "rgba(124, 106, 214, 0.14)",
                          backgroundColor: "rgba(255,255,255,0.82)",
                        }}
                      >
                        <Skeleton animation="wave" variant="text" sx={{ mx: "auto", width: "70%", fontSize: "0.95rem" }} />
                        <Skeleton animation="wave" variant="text" sx={{ mx: "auto", width: "52%", fontSize: "1.5rem" }} />
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
                      <Skeleton animation="wave" variant="text" sx={{ mx: "auto", width: 140, fontSize: "1.2rem" }} />
                      <Skeleton animation="wave" variant="text" sx={{ mt: 1.25, width: "100%" }} />
                      <Skeleton animation="wave" variant="text" sx={{ width: "92%" }} />
                      <Skeleton animation="wave" variant="text" sx={{ width: "76%" }} />
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
                      <Skeleton animation="wave" variant="text" sx={{ mx: "auto", width: 150, fontSize: "1.2rem" }} />
                      <Stack spacing={1.1} sx={{ mt: 1.25 }}>
                        {Array.from({ length: 4 }, (_, index) => (
                          <Skeleton key={`loading-row-${index}`} animation="wave" variant="rounded" height={44} />
                        ))}
                      </Stack>
                    </Paper>
                  </Box>
                </>
              ) : hasLoadError ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2.25, sm: 2.5 },
                    borderRadius: 3,
                    borderColor: "rgba(239, 68, 68, 0.16)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(255,246,246,0.96) 100%)",
                  }}
                >
                  <Stack spacing={1.25} alignItems="center" sx={{ textAlign: "center" }}>
                    <Chip
                      label="Could not load this week"
                      sx={{
                        borderRadius: 999,
                        bgcolor: "rgba(239, 68, 68, 0.08)",
                        color: "#b42318",
                        border: "1px solid rgba(239, 68, 68, 0.14)",
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="h3" sx={{ fontSize: { xs: "1.12rem", sm: "1.2rem" } }}>
                      Something interrupted the weekly summary
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#7a4850", maxWidth: 520, lineHeight: 1.7 }}>
                      {loadError}
                    </Typography>
                    <Button
                      variant="outlined"
                      onClick={() => {
                        setSelectedWeekStart(currentWeekStartKey);
                        setSelectedWeekEnd(currentWeekEndKey);
                      }}
                      sx={{ mt: 0.5, borderRadius: 999, textTransform: "none" }}
                    >
                      Return to current week
                    </Button>
                  </Stack>
                </Paper>
              ) : isEmptyWeek ? (
                <Paper
                  variant="outlined"
                  sx={{
                    p: { xs: 2.25, sm: 2.5 },
                    borderRadius: 3,
                    borderColor: "rgba(124, 106, 214, 0.14)",
                    background:
                      "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, rgba(247,245,255,0.98) 100%)",
                  }}
                >
                  <Stack spacing={1.3} alignItems="center" sx={{ textAlign: "center" }}>
                    <Chip
                      label="No logs in this week yet"
                      sx={{
                        borderRadius: 999,
                        bgcolor: "rgba(99, 102, 241, 0.08)",
                        color: "#4338ca",
                        border: "1px solid rgba(99, 102, 241, 0.12)",
                        fontWeight: 600,
                      }}
                    />
                    <Typography variant="h3" sx={{ fontSize: { xs: "1.12rem", sm: "1.2rem" } }}>
                      This range is ready for its first work log
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#64748b", maxWidth: 560, lineHeight: 1.7 }}>
                      Save a daily entry for {weekRangeLabel} and your totals, busiest day, top
                      project, recap, and day-by-day breakdown will appear here automatically.
                    </Typography>
                    <Stack
                      direction={{ xs: "column", sm: "row" }}
                      spacing={1}
                      justifyContent="center"
                      alignItems="center"
                    >
                      <Button
                        component={RouterLink}
                        to="/today"
                        variant="contained"
                        sx={{ borderRadius: 999, px: 2.25, textTransform: "none" }}
                      >
                        Log a day
                      </Button>
                      <Chip
                        label="Tip: even one saved day unlocks the weekly recap"
                        sx={{
                          borderRadius: 999,
                          bgcolor: "rgba(255,255,255,0.76)",
                          border: "1px solid rgba(124, 106, 214, 0.12)",
                          color: "#5b5676",
                        }}
                      />
                    </Stack>
                  </Stack>
                </Paper>
              ) : hasWeeklyData ? (
                <>
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        lg: "repeat(5, minmax(0, 1fr))",
                      },
                      gap: 1.15,
                    }}
                  >
                    {summaryMetrics.map((metric) => (
                      <Paper
                        key={metric.label}
                        variant="outlined"
                        sx={{
                          p: { xs: 1.5, sm: 1.65 },
                          borderRadius: 2.5,
                          borderColor: "rgba(124, 106, 214, 0.14)",
                          backgroundColor: "rgba(255,255,255,0.82)",
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ color: "#667085", mb: 0.55, fontSize: { xs: "0.84rem", sm: "0.88rem" } }}
                        >
                          {metric.label}
                        </Typography>
                        <Typography
                          variant="h4"
                          sx={{
                            fontSize: { xs: "0.98rem", sm: "1.05rem", lg: "1.15rem" },
                            lineHeight: 1.14,
                            letterSpacing: "-0.02em",
                            maxWidth: "10ch",
                            mx: "auto",
                            textWrap: "balance",
                            overflowWrap: "anywhere",
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
                        {recapText}
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
                        {visibleBreakdownRows.map((item) => (
                          <Box
                            key={item.date}
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
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="subtitle2" sx={{ color: "#1f2340" }}>
                                {item.day}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                                {item.dateLabel}
                              </Typography>
                            </Box>
                            <Box sx={{ minWidth: 0, textAlign: "right" }}>
                              <Typography variant="body2" sx={{ color: "#1f2340", fontWeight: 600 }}>
                                {item.hours > 0 ? `${formatHours(item.hours)} hrs` : "No log yet"}
                              </Typography>
                              <Typography variant="caption" sx={{ color: "#6b7280" }}>
                                {item.hours > 0
                                  ? `${item.projectLabel}${item.receiptCount > 0 ? ` · ${item.receiptCount} receipt${item.receiptCount === 1 ? "" : "s"}` : ""}`
                                  : "No saved entry"}
                              </Typography>
                            </Box>
                          </Box>
                        ))}
                      </Stack>
                    </Paper>
                  </Box>
                </>
              ) : null}
            </Stack>
          </Box>
        </Paper>
      </Stack>
    </Box>
  );
}
