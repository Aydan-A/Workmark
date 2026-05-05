import { Box, Paper, Stack, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import type { WeeklyTopProject } from "../../entries/entry.types";
import { formatHoursDecimal } from "../../../utils/formatters";

type Props = {
  monthTotalHours: number;
  remoteHours: number;
  loggedDays: number;
  topProject: WeeklyTopProject | null;
};

const labelSx = {
  fontSize: "0.6875rem",
  fontWeight: 600,
  letterSpacing: "0.08em",
  textTransform: "uppercase" as const,
  color: "text.secondary",
  lineHeight: 1,
};

const valueSx = {
  fontSize: "2rem",
  fontWeight: 700,
  lineHeight: 1.1,
  color: "text.primary",
  mt: 0.75,
  letterSpacing: "-0.02em",
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 2.25, flex: 1, minWidth: 0 }}>
      <Typography sx={labelSx}>{label}</Typography>
      <Typography sx={valueSx}>{value}</Typography>
    </Paper>
  );
}

export function CalendarStats({ monthTotalHours, remoteHours, loggedDays, topProject }: Props) {
  const theme = useTheme();

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mt: 2.5 }}>
      <StatCard label="Month Total" value={`${formatHoursDecimal(monthTotalHours)}h`} />
      <StatCard label="Remote" value={`${formatHoursDecimal(remoteHours)}h`} />
      <StatCard label="Logged Days" value={String(loggedDays)} />

      <Paper variant="outlined" sx={{ p: 2.25, flex: 1, minWidth: 0 }}>
        <Typography sx={labelSx}>Top Project</Typography>
        {topProject ? (
          <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.75 }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: theme.palette.primary.main,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontSize: "1.25rem",
                fontWeight: 700,
                lineHeight: 1.2,
                color: "text.primary",
                letterSpacing: "-0.01em",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {topProject.name}
            </Typography>
          </Stack>
        ) : (
          <Typography sx={{ ...valueSx, fontSize: "1.5rem", color: "text.secondary" }}>
            —
          </Typography>
        )}
      </Paper>
    </Stack>
  );
}
