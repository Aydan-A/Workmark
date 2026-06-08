import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import { SparklineLine } from "./Sparkline";
import type { ManagedTeamMember } from "../hooks/useManagedTeam";

type ManagedTeamSectionProps = {
  team: ManagedTeamMember[];
};

function formatHours(value: number): string {
  return `${value.toFixed(1)}h`;
}

export default function ManagedTeamSection({ team }: ManagedTeamSectionProps) {
  const theme = useTheme();

  if (team.length === 0) return null;

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" sx={{ fontWeight: 700, color: "text.primary", mb: 1.5 }}>
        Your team this week
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))", md: "repeat(3, minmax(0, 1fr))" },
          gap: 2,
        }}
      >
        {team.map((member) => (
          <Paper
            key={member.uid}
            variant="outlined"
            sx={{
              p: 2.25,
              borderRadius: "20px",
              borderColor: alpha(theme.palette.common.white, 0.8),
              bgcolor: alpha(theme.palette.common.white, 0.4),
            }}
          >
            <Stack spacing={1.25}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                  {member.fullName}
                </Typography>
                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", wordBreak: "break-word" }}
                >
                  {member.email}
                </Typography>
              </Box>

              <Stack direction="row" spacing={2}>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                    }}
                  >
                    Total
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {formatHours(member.totalHours)}
                  </Typography>
                </Box>
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      display: "block",
                      color: "text.secondary",
                      fontWeight: 700,
                      textTransform: "uppercase",
                      letterSpacing: "0.16em",
                    }}
                  >
                    Remote
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    {formatHours(member.remoteHours)} · {member.remotePct}%
                  </Typography>
                </Box>
              </Stack>

              <SparklineLine data={member.weeklySpark} />
            </Stack>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}
