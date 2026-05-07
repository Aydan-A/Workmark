import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { formatHoursDuration } from "../../../utils/formatters";

type Props = {
  totalHours: number;
  remoteHours: number;
  officeHours: number;
};

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography
        variant="caption"
        sx={{ color: "text.secondary", display: "block", mb: 0.25 }}
      >
        {label}
      </Typography>
      <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
        {value}
      </Typography>
    </Box>
  );
}

export function DaySummaryRow({ totalHours, remoteHours, officeHours }: Props) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2.5,
        py: 1.75,
        borderRadius: "16px",
        mb: 2,
        display: "flex",
        gap: 4,
      }}
    >
      <Stat label="Total" value={formatHoursDuration(totalHours)} />
      <Stat label="Remote" value={formatHoursDuration(remoteHours)} />
      <Stat label="Office" value={formatHoursDuration(officeHours)} />
    </Paper>
  );
}
