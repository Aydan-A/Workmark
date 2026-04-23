import { useEffect, useMemo, useState } from "react";
import { Box, Button, ButtonBase, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import type { WeeklyPoint } from "../../entries/entry.types";
import {
  dashboardCardSubtitleSx,
  dashboardCardTitleSx,
  dashboardFocusVisibleSx,
  dashboardGlassCardSx,
  dashboardSectionCardPaddingSx,
} from "../../../styles/dashboard";
import { formatHours } from "../../../utils/formatters";

type SummaryChipButtonProps = {
  label: string;
  ariaLabel: string;
  onClick?: () => void;
};

function SummaryChipButton({ label, ariaLabel, onClick }: SummaryChipButtonProps) {
  return (
    <ButtonBase
      onClick={onClick}
      aria-label={ariaLabel}
      sx={{
        px: 1.25,
        py: 0.7,
        borderRadius: 999,
        border: "1px solid rgba(108, 99, 255, 0.12)",
        backgroundColor: "rgba(255,255,255,0.36)",
        color: "#6f768f",
        fontSize: "0.875rem",
        fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        letterSpacing: "-0.01em",
        lineHeight: 1.2,
        cursor: "pointer",
        transition: "background-color 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          backgroundColor: "rgba(108,99,255,0.08)",
          borderColor: "rgba(108,99,255,0.18)",
        },
        "&:active": {
          transform: "translateY(1px)",
        },
        ...dashboardFocusVisibleSx,
      }}
    >
      {label}
    </ButtonBase>
  );
}

export type WeeklyOverviewCardProps = {
  title?: string;
  subtitle?: string;
  days: WeeklyPoint[];
  totalHours: number;
  activeDays: number;
  activeDaysLabel: string;
  peakDay: WeeklyPoint;
  averagePerDay: number;
  selectedDayKey?: string;
  defaultSelectedDayKey?: string;
  onOpenCalendar?: () => void;
  onTotalHoursClick?: () => void;
  onActiveDaysClick?: () => void;
  onPeakDayClick?: (day: WeeklyPoint) => void;
  onDaySelect?: (day: WeeklyPoint) => void;
};

function getInitialSelectedDayKey(days: WeeklyPoint[], peakDay: WeeklyPoint) {
  const todayWithHours = days.find((day) => day.isToday && day.hours > 0);
  if (todayWithHours) return todayWithHours.dateKey;

  if (peakDay.hours > 0) return peakDay.dateKey;

  const firstActiveDay = days.find((day) => day.hours > 0);
  if (firstActiveDay) return firstActiveDay.dateKey;

  return days.find((day) => day.isToday)?.dateKey ?? days[0]?.dateKey ?? "";
}

export default function WeeklyOverviewCard({
  title = "Weekly Overview",
  subtitle = "Your hours across the current week.",
  days,
  totalHours,
  activeDays,
  activeDaysLabel,
  peakDay,
  averagePerDay,
  selectedDayKey,
  defaultSelectedDayKey,
  onOpenCalendar,
  onTotalHoursClick,
  onActiveDaysClick,
  onPeakDayClick,
  onDaySelect,
}: WeeklyOverviewCardProps) {
  const theme = useTheme();
  const highestDay = useMemo(() => Math.max(...days.map((day) => day.hours), 1), [days]);
  const preferredSelectedDayKey = useMemo(
    () => getInitialSelectedDayKey(days, peakDay),
    [days, peakDay],
  );
  const [internalSelectedDayKey, setInternalSelectedDayKey] = useState(
    defaultSelectedDayKey ?? selectedDayKey ?? preferredSelectedDayKey,
  );

  useEffect(() => {
    if (selectedDayKey !== undefined) return;

    if (!days.some((day) => day.dateKey === internalSelectedDayKey)) {
      setInternalSelectedDayKey(preferredSelectedDayKey);
    }
  }, [days, preferredSelectedDayKey, internalSelectedDayKey, selectedDayKey]);

  const resolvedSelectedDayKey = selectedDayKey ?? internalSelectedDayKey;
  const selectedDay = days.find((day) => day.dateKey === resolvedSelectedDayKey) ?? days[0] ?? peakDay;
  const hasSelectedDayHours = selectedDay ? selectedDay.hours > 0 : false;
  const selectedDayShare = hasSelectedDayHours && totalHours > 0
    ? Math.round((selectedDay.hours / totalHours) * 100)
    : 0;
  const selectedDayStatusLabel = selectedDay.isToday
    ? "Today"
    : selectedDay.dateKey === peakDay.dateKey && peakDay.hours > 0
      ? "Peak day"
      : hasSelectedDayHours
        ? "Logged day"
        : "Empty day";
  const selectedDaySummaryLabel = !hasSelectedDayHours
    ? "Pick another bar to compare logged time."
    : `${selectedDayShare}% of this week's total hours.`;

  const handleDaySelect = (day: WeeklyPoint) => {
    if (selectedDayKey === undefined) {
      setInternalSelectedDayKey(day.dateKey);
    }

    onDaySelect?.(day);
  };

  const handlePeakDayClick = () => {
    handleDaySelect(peakDay);
    onPeakDayClick?.(peakDay);
  };

  return (
    <Paper
      variant="outlined"
      sx={{
        ...dashboardSectionCardPaddingSx,
        ...dashboardGlassCardSx,
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          flexWrap: "wrap",
          mb: 2.25,
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={dashboardCardTitleSx}
          >
            {title}
          </Typography>
          <Typography variant="body2" sx={dashboardCardSubtitleSx}>
            {subtitle}
          </Typography>
        </Box>

        <Button
          type="button"
          onClick={onOpenCalendar}
          aria-label="Open calendar view"
          sx={{
            px: 1.4,
            py: 0.7,
            minWidth: 0,
            fontWeight: 600,
            letterSpacing: "-0.01em",
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            borderRadius: 999,
            color: "primary.main",
            cursor: "pointer",
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.08),
            },
            ...dashboardFocusVisibleSx,
          }}
        >
          Calendar
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          gap: 0.75,
          flexWrap: "wrap",
          mb: 2.25,
        }}
      >
        <SummaryChipButton
          label={`${formatHours(totalHours)} hrs total`}
          ariaLabel={`View total hours for this week: ${formatHours(totalHours)} hours`}
          onClick={onTotalHoursClick}
        />
        <SummaryChipButton
          label={`${activeDays} ${activeDaysLabel}`}
          ariaLabel={`View active days summary: ${activeDays} ${activeDaysLabel}`}
          onClick={onActiveDaysClick}
        />
        <SummaryChipButton
          label={`${peakDay.day} peak`}
          ariaLabel={`Select peak day ${peakDay.day} with ${formatHours(peakDay.hours)} hours`}
          onClick={handlePeakDayClick}
        />
      </Box>

      <Box
        sx={{
          position: "relative",
          px: { xs: 0.2, sm: 0.35 },
          pt: { xs: 0.6, sm: 0.75 },
          pb: { xs: 0.3, sm: 0.4 },
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            inset: { xs: "18px 10px 44px", sm: "18px 12px 46px" },
            backgroundImage:
              "linear-gradient(to top, rgba(108, 99, 255, 0.07) 1px, transparent 1px)",
            backgroundSize: "100% 25%",
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: { xs: 0.45, sm: 0.7 },
            position: "relative",
            zIndex: 1,
          }}
        >
          {days.map((day) => {
            const isSelected = day.dateKey === resolvedSelectedDayKey;
            const barRatio = day.hours / highestDay;
            const fillHeight = day.hours > 0 ? `${Math.max(barRatio * 100, 18)}%` : "0%";

            return (
              <ButtonBase
                key={day.dateKey}
                type="button"
                onClick={() => handleDaySelect(day)}
                aria-label={`${day.day}, ${day.dateLabel}, ${day.hours > 0 ? `${formatHours(day.hours)} hours logged` : "no hours logged"}`}
                aria-pressed={isSelected}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.6,
                  px: { xs: 0.2, sm: 0.35 },
                  py: 0.45,
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "background-color 160ms ease, transform 160ms ease",
                  "&:hover": {
                    backgroundColor: "rgba(108,99,255,0.03)",
                  },
                  "&:active": {
                    transform: "translateY(1px)",
                  },
                  ...dashboardFocusVisibleSx,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    minHeight: 16,
                    color: day.hours > 0 ? "#6f768f" : "#b8bcd0",
                    fontWeight: day.hours > 0 ? 600 : 500,
                  }}
                >
                  {day.hours > 0 ? `${formatHours(day.hours)}h` : ""}
                </Typography>

                {/* The whole day column is the control; the track keeps empty days explicit without competing with real data. */}
                <Box
                  sx={{
                    width: "100%",
                    height: { xs: 144, sm: 176 },
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      width: { xs: "74%", sm: "70%" },
                      height: "100%",
                      display: "flex",
                      alignItems: "flex-end",
                      borderRadius: "14px",
                      backgroundColor: isSelected ? "rgba(108,99,255,0.08)" : "rgba(108,99,255,0.045)",
                      boxShadow: isSelected
                        ? "inset 0 0 0 1px rgba(108,99,255,0.1)"
                        : "inset 0 0 0 1px rgba(108,99,255,0.035)",
                      overflow: "hidden",
                      transition: "background-color 160ms ease, box-shadow 160ms ease",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: fillHeight,
                        borderRadius: "14px 14px 9px 9px",
                        background:
                          day.hours > 0
                            ? "linear-gradient(180deg, #9B8FFF 0%, #6C63FF 100%)"
                            : "transparent",
                        boxShadow:
                          day.hours > 0
                            ? "0 10px 22px rgba(108,99,255,0.16)"
                            : "none",
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  variant="subtitle2"
                  sx={{
                    color: day.isToday || isSelected ? "#545c88" : "#8f96ad",
                    fontWeight: day.isToday || isSelected ? 700 : 600,
                    px: 0.7,
                    py: 0.2,
                    borderRadius: 999,
                    backgroundColor: isSelected ? "rgba(108,99,255,0.08)" : "transparent",
                    transition: "background-color 160ms ease, color 160ms ease",
                  }}
                >
                  {day.day}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          mt: 1.85,
          p: { xs: 1.5, sm: 1.85 },
          borderRadius: "20px",
          backgroundColor: "rgba(255,255,255,0.48)",
          borderColor: "rgba(255,255,255,0.8)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1.15fr) minmax(0, 0.85fr)" },
            alignItems: "center",
          }}
        >
          <Box
            sx={{
              pr: { xs: 0, md: 2.25 },
              pb: { xs: 1.5, md: 0 },
              borderBottom: { xs: "1px solid #EEF0F3", md: "none" },
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 0.9,
                flexWrap: "wrap",
                mb: 0.9,
              }}
            >
              <Typography
                variant="body2"
                sx={{
                  color: "#8B8B9E",
                  fontSize: "0.85rem",
                  fontWeight: 500,
                }}
              >
                {selectedDay.day}, {selectedDay.dateLabel}
              </Typography>
              <Typography
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  px: "12px",
                  py: "6px",
                  borderRadius: 999,
                  bgcolor: "#6C63FF",
                  color: "#FFFFFF",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {selectedDayStatusLabel}
              </Typography>
            </Box>

            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "1.55rem", sm: "1.75rem" },
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#1A1A2E",
              }}
            >
              {hasSelectedDayHours ? `${formatHours(selectedDay.hours)} hrs logged` : "No entry logged"}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.35,
                color: "#8B8B9E",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              {hasSelectedDayHours ? selectedDaySummaryLabel : "No hours were saved for this date yet."}
            </Typography>
          </Box>

          <Box
            sx={{
              pl: { xs: 0, md: 2.25 },
              pt: { xs: 1.5, md: 0 },
              borderTop: { xs: "1px solid #EEF0F3", md: "none" },
              borderLeft: { xs: "none", md: "1px solid #EEF0F3" },
            }}
          >
            <Typography
              variant="body2"
              sx={{
                color: "#8B8B9E",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Average per day
            </Typography>
            <Typography
              variant="h3"
              sx={{
                mt: 0.45,
                fontSize: { xs: "1.55rem", sm: "1.75rem" },
                fontWeight: 700,
                letterSpacing: "-0.03em",
                color: "#1A1A2E",
              }}
            >
              {formatHours(averagePerDay)} hrs
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 0.35,
                color: "#8B8B9E",
                fontSize: "0.85rem",
                fontWeight: 500,
              }}
            >
              Based on saved weekly entries.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Paper>
  );
}
