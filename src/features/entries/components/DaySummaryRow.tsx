import { Box, Paper, Typography } from "@mui/material";

type Props = {
  totalHours: number;
  remoteHours: number;
  officeHours: number;
};

function fmtH(hours: number): string {
  const totalMins = Math.round(hours * 60);
  const h = Math.floor(totalMins / 60);
  const m = totalMins % 60;
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

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
      <Stat label="Total" value={fmtH(totalHours)} />
      <Stat label="Remote" value={fmtH(remoteHours)} />
      <Stat label="Office" value={fmtH(officeHours)} />
    </Paper>
  );
}
