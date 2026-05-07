import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import type { CalendarDay } from "../calendar.utils";
import { formatHoursDecimal } from "../../../utils/formatters";

type Props = {
  day: CalendarDay;
};

export function CalendarCell({ day }: Props) {
  const theme = useTheme();
  const navigate = useNavigate();

  const bucketBg: Record<number, string> = {
    0: "transparent",
    1: alpha(theme.palette.primary.main, 0.15),
    2: alpha(theme.palette.primary.main, 0.4),
    3: theme.palette.primary.main,
  };

  const isFilled = day.bucket === 3;
  const isEmpty = day.bucket === 0;
  const bg = bucketBg[day.bucket];

  const baseBorderColor = day.isToday
    ? theme.palette.primary.main
    : day.isCurrentMonth
    ? theme.palette.divider
    : alpha(theme.palette.divider, 0.5);

  const borderWidth = day.isToday ? "1.5px" : "1px";

  return (
    <Box
      onClick={() => navigate(`/today?date=${day.dateKey}`)}
      sx={{
        minHeight: 96,
        aspectRatio: "auto",
        borderRadius: "8px",
        backgroundColor: bg,
        border: `${borderWidth} solid ${baseBorderColor}`,
        cursor: "pointer",
        position: "relative",
        transition: "border-color 0.12s ease, background-color 0.12s ease, filter 0.12s ease",
        "&:hover": {
          borderColor: alpha(theme.palette.primary.main, 0.4),
          ...(isEmpty
            ? { backgroundColor: theme.palette.action.hover }
            : { filter: "brightness(1.05)" }),
        },
      }}
    >
      <Typography
        component="span"
        sx={{
          position: "absolute",
          top: 7,
          left: 9,
          fontSize: "0.875rem",
          fontWeight: 600,
          lineHeight: 1,
          color: isFilled
            ? theme.palette.primary.contrastText
            : day.isCurrentMonth
            ? "text.primary"
            : "text.secondary",
        }}
      >
        {format(day.date, "d")}
      </Typography>

      {day.hours > 0 && (
        <Typography
          component="span"
          sx={{
            position: "absolute",
            bottom: 7,
            right: 8,
            fontSize: "0.75rem",
            fontWeight: 600,
            lineHeight: 1,
            color: isFilled
              ? alpha(theme.palette.primary.contrastText, 0.85)
              : theme.palette.primary.main,
          }}
        >
          {formatHoursDecimal(day.hours)}h
        </Typography>
      )}
    </Box>
  );
}
