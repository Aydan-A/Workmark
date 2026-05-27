import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { WeeklyPoint } from "../../entries/entry.types";
import {
  dashboardCardTitleSx,
  dashboardFocusVisibleSx,
  dashboardGlassCardSx,
  dashboardSectionCardPaddingSx,
} from "../../../styles/dashboard";
import { formatHoursDecimal } from "../../../utils/formatters";
import { BRAND_PURPLE, GREY, brandPurpleAlpha, whiteAlpha } from "../../../styles/colors";
import { theme } from "../../../styles/theme";

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
        border: `1px solid ${brandPurpleAlpha(0.12)}`,
        backgroundColor: whiteAlpha(0.36),
        color: "ink.muted",
        fontSize: "0.875rem",
        fontWeight: 600,
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        letterSpacing: "-0.01em",
        lineHeight: 1.2,
        cursor: "pointer",
        transition:
          "background-color 160ms ease, border-color 160ms ease, transform 160ms ease, box-shadow 160ms ease",
        "&:hover": {
          backgroundColor: brandPurpleAlpha(0.08),
          borderColor: brandPurpleAlpha(0.18),
        },
        "&:active": { transform: "translateY(1px)" },
        ...dashboardFocusVisibleSx,
      }}
    >
      {label}
    </ButtonBase>
  );
}

export type WeeklyOverviewCardProps = {
  title?: string;
  days: WeeklyPoint[];
  totalHours: number;
  activeDays: number;
  activeDaysLabel: string;
  peakDay: WeeklyPoint;
  averagePerDay: number;
  rangeSelector?: ReactNode;
  selectedDayKey?: string;
  defaultSelectedDayKey?: string;
  onBarClick?: (day: WeeklyPoint) => void;
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
  days,
  totalHours,
  activeDays,
  activeDaysLabel,
  peakDay,
  averagePerDay,
  rangeSelector,
  selectedDayKey,
  defaultSelectedDayKey,
  onBarClick,
  onTotalHoursClick,
  onActiveDaysClick,
  onPeakDayClick,
  onDaySelect,
}: WeeklyOverviewCardProps) {
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
  const selectedDay =
    days.find((day) => day.dateKey === resolvedSelectedDayKey) ?? days[0] ?? peakDay;
  const hasSelectedDayHours = selectedDay ? selectedDay.hours > 0 : false;
  const selectedDayShare =
    hasSelectedDayHours && totalHours > 0
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
    : `${selectedDayShare}% of this period's total hours.`;

  // Show date labels (MMM D) instead of weekday names when range spans > 7 days
  const showDateLabel = days.length > 7;

  const handleDaySelect = (day: WeeklyPoint) => {
    if (selectedDayKey === undefined) setInternalSelectedDayKey(day.dateKey);
    onDaySelect?.(day);
  };

  const handleBarClick = (day: WeeklyPoint) => {
    handleDaySelect(day);
    onBarClick?.(day);
  };

  const handlePeakDayClick = () => {
    handleDaySelect(peakDay);
    onPeakDayClick?.(peakDay);
  };

  return (
    <Paper
      variant="outlined"
      sx={{ ...dashboardSectionCardPaddingSx, ...dashboardGlassCardSx, height: "100%" }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 1.5,
          mb: rangeSelector ? 1.5 : 2.25,
        }}
      >
        <Typography variant="h2" sx={dashboardCardTitleSx}>
          {title}
        </Typography>
      </Box>

      {/* Range selector */}
      {rangeSelector}

      {/* Summary chips */}
      <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap", mb: 2.25 }}>
        <SummaryChipButton
          label={`${formatHoursDecimal(totalHours)} hrs total`}
          ariaLabel={`View total hours for this period: ${formatHoursDecimal(totalHours)} hours`}
          onClick={onTotalHoursClick}
        />
        <SummaryChipButton
          label={`${activeDays} ${activeDaysLabel}`}
          ariaLabel={`View active days summary: ${activeDays} ${activeDaysLabel}`}
          onClick={onActiveDaysClick}
        />
        <SummaryChipButton
          label={`${peakDay.day} peak`}
          ariaLabel={`Select peak day ${peakDay.day} with ${formatHoursDecimal(peakDay.hours)} hours`}
          onClick={handlePeakDayClick}
        />
      </Box>

      {/* Bar chart */}
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
            backgroundImage: `linear-gradient(to top, ${brandPurpleAlpha(0.07)} 1px, transparent 1px)`,
            backgroundSize: "100% 25%",
            pointerEvents: "none",
          },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: `repeat(${days.length}, minmax(0, 1fr))`,
            gap: { xs: 0.3, sm: 0.5 },
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
                onClick={() => handleBarClick(day)}
                aria-label={`View ${day.day}, ${day.dateLabel} — ${day.hours > 0 ? `${formatHoursDecimal(day.hours)}h logged` : "0h logged"}`}
                aria-pressed={isSelected}
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 0.6,
                  px: { xs: 0.15, sm: 0.25 },
                  py: 0.45,
                  borderRadius: "14px",
                  cursor: "pointer",
                  transition: "background-color 160ms ease, transform 160ms ease",
                  "&:hover": {
                    backgroundColor: brandPurpleAlpha(0.04),
                    "& .bar-fill": {
                      filter: day.hours > 0 ? "brightness(1.1)" : undefined,
                      transform: "scaleX(1.02)",
                    },
                    "& .bar-day-label": { color: "primary.main" },
                  },
                  "&:active": { transform: "translateY(1px)" },
                  ...dashboardFocusVisibleSx,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    minHeight: 16,
                    fontSize: days.length > 14 ? "0.6rem" : "0.7rem",
                    color: day.hours > 0 ? "ink.muted" : "ink.disabled",
                    fontWeight: day.hours > 0 ? 600 : 500,
                  }}
                >
                  {day.hours > 0 ? `${formatHoursDecimal(day.hours)}h` : ""}
                </Typography>

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
                      width: days.length > 14 ? "80%" : { xs: "74%", sm: "70%" },
                      height: "100%",
                      display: "flex",
                      alignItems: "flex-end",
                      borderRadius: "14px",
                      backgroundColor: isSelected
                        ? brandPurpleAlpha(0.08)
                        : brandPurpleAlpha(0.045),
                      boxShadow: isSelected
                        ? `inset 0 0 0 1px ${brandPurpleAlpha(0.1)}`
                        : `inset 0 0 0 1px ${brandPurpleAlpha(0.035)}`,
                      overflow: "hidden",
                      transition: "background-color 160ms ease, box-shadow 160ms ease",
                    }}
                  >
                    <Box
                      className="bar-fill"
                      sx={{
                        width: "100%",
                        height: fillHeight,
                        borderRadius: "14px 14px 9px 9px",
                        background:
                          day.hours > 0
                            ? `linear-gradient(180deg, ${theme.palette.accentPurple.bright} 0%, ${BRAND_PURPLE} 100%)`
                            : "transparent",
                        boxShadow:
                          day.hours > 0 ? `0 10px 22px ${brandPurpleAlpha(0.16)}` : "none",
                        transition: "filter 160ms ease, transform 160ms ease",
                        transformOrigin: "bottom",
                      }}
                    />
                  </Box>
                </Box>

                <Typography
                  className="bar-day-label"
                  variant="subtitle2"
                  sx={{
                    fontSize:
                      days.length > 14 ? "0.6rem" : days.length > 7 ? "0.68rem" : undefined,
                    color: day.isToday || isSelected ? "ink.labelDark" : "ink.labelMuted",
                    fontWeight: day.isToday || isSelected ? 700 : 600,
                    px: 0.5,
                    py: 0.2,
                    borderRadius: 999,
                    backgroundColor: isSelected ? brandPurpleAlpha(0.08) : "transparent",
                    transition: "background-color 160ms ease, color 160ms ease",
                    lineHeight: 1.2,
                    textAlign: "center",
                  }}
                >
                  {showDateLabel ? day.dateLabel : day.day}
                </Typography>
              </ButtonBase>
            );
          })}
        </Box>
      </Box>

      {/* Bottom summary */}
      <Paper
        variant="outlined"
        sx={{
          mt: 1.85,
          p: { xs: 1.5, sm: 1.85 },
          borderRadius: "20px",
          backgroundColor: whiteAlpha(0.48),
          borderColor: "glass.border",
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
              borderBottom: { xs: `1px solid ${GREY[100]}`, md: "none" },
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
                sx={{ color: "ink.soft", fontSize: "0.85rem", fontWeight: 500 }}
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
                  bgcolor: "primary.main",
                  color: "common.white",
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
                color: "ink.dark",
              }}
            >
              {hasSelectedDayHours
                ? `${formatHoursDecimal(selectedDay.hours)} hrs logged`
                : "No entry logged"}
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.35, color: "ink.soft", fontSize: "0.85rem", fontWeight: 500 }}
            >
              {hasSelectedDayHours
                ? selectedDaySummaryLabel
                : "No hours were saved for this date yet."}
            </Typography>
          </Box>

          <Box
            sx={{
              pl: { xs: 0, md: 2.25 },
              pt: { xs: 1.5, md: 0 },
              borderTop: { xs: `1px solid ${GREY[100]}`, md: "none" },
              borderLeft: { xs: "none", md: `1px solid ${GREY[100]}` },
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "ink.soft", fontSize: "0.85rem", fontWeight: 500 }}
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
                color: "ink.dark",
              }}
            >
              {formatHoursDecimal(averagePerDay)} hrs
            </Typography>
            <Typography
              variant="body2"
              sx={{ mt: 0.35, color: "ink.soft", fontSize: "0.85rem", fontWeight: 500 }}
            >
              Based on saved entries.
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Paper>
  );
}
