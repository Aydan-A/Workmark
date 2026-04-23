import { Paper, Stack, Typography } from "@mui/material";
import { formatHours } from "../../../utils/formatters";

type Props = {
  daysLogged: number;
  daysInMonth: string;
  totalHours: number;
  remoteHours: number;
};

const statPaperSx = {
  p: 2.25,
  borderRadius: "24px",
  borderColor: "rgba(255,255,255,0.8)",
  flex: 1,
};

export function CalendarStats({ daysLogged, daysInMonth, totalHours, remoteHours }: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
      <Paper variant="outlined" sx={statPaperSx}>
        <Typography variant="subtitle2" sx={{ color: "#6b7280" }}>Logged days</Typography>
        <Typography variant="h4" sx={{ mt: 0.25 }}>
          {daysLogged}{" "}
          <Typography component="span" variant="body2" sx={{ color: "#6b7280" }}>/ {daysInMonth}</Typography>
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={statPaperSx}>
        <Typography variant="subtitle2" sx={{ color: "#6b7280" }}>Total hours</Typography>
        <Typography variant="h4" sx={{ mt: 0.25 }}>{formatHours(totalHours)}h</Typography>
      </Paper>
      <Paper variant="outlined" sx={statPaperSx}>
        <Typography variant="subtitle2" sx={{ color: "#6b7280" }}>Remote hours</Typography>
        <Typography variant="h4" sx={{ mt: 0.25 }}>{formatHours(remoteHours)}h</Typography>
      </Paper>
    </Stack>
  );
}
