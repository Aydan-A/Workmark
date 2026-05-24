import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { formatHoursDecimal } from "../../../utils/formatters";

type Props = {
  daysLogged: number;
  daysInMonth: string;
  totalHours: number;
  remoteHours: number;
};

const statPaperSx = {
  p: 2.25,
  borderRadius: "24px",
  borderColor: "glass.border",
  flex: 1,
};

export function CalendarStats({ daysLogged, daysInMonth, totalHours, remoteHours }: Props) {
  return (
    <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 2 }}>
      <Paper variant="outlined" sx={statPaperSx}>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Logged days</Typography>
        <Typography variant="h4" sx={{ mt: 0.25 }}>
          {daysLogged}{" "}
          <Typography component="span" variant="body2" sx={{ color: "text.secondary" }}>/ {daysInMonth}</Typography>
        </Typography>
      </Paper>
      <Paper variant="outlined" sx={statPaperSx}>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Total hours</Typography>
        <Typography variant="h4" sx={{ mt: 0.25 }}>{formatHoursDecimal(totalHours)}h</Typography>
      </Paper>
      <Paper variant="outlined" sx={statPaperSx}>
        <Typography variant="subtitle2" sx={{ color: "text.secondary" }}>Remote hours</Typography>
        <Typography variant="h4" sx={{ mt: 0.25 }}>{formatHoursDecimal(remoteHours)}h</Typography>
      </Paper>
    </Stack>
  );
}
