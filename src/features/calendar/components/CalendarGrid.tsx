import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Typography from "@mui/material/Typography";
import { CalendarCell } from "./CalendarCell";
import type { CalendarDay } from "../calendar.utils";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  days: CalendarDay[];
  loadError: string | null;
  isLoading: boolean;
};

export function CalendarGrid({ days, loadError, isLoading }: Props) {
  return (
    <Box sx={{ mt: 2.5 }}>
      {loadError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      <Paper
        variant="outlined"
        sx={{ p: "12px", borderRadius: "16px" }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "6px",
            mb: 0,
          }}
        >
          {WEEK_DAYS.map((day) => (
            <Typography
              key={day}
              sx={{
                textAlign: "center",
                fontSize: "0.625rem",
                fontWeight: 700,
                letterSpacing: "0.07em",
                textTransform: "uppercase",
                color: "text.secondary",
                py: 0.5,
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        <Divider sx={{ my: 1 }} />

        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "6px",
          }}
        >
          {isLoading
            ? Array.from({ length: 35 }).map((_, i) => (
                <Skeleton
                  key={i}
                  variant="rectangular"
                  sx={{ minHeight: 96, borderRadius: "8px" }}
                />
              ))
            : days.map((day) => <CalendarCell key={day.dateKey} day={day} />)}
        </Box>
      </Paper>
    </Box>
  );
}
