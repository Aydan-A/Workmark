import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import type { TopProjectStat } from "../../entries/entry.types";
import { formatHM } from "../dashboard.utils";
import {
  dashboardGlassCardSx,
  dashboardSectionCardPaddingSx,
} from "../../../styles/dashboard";
import { CHART_FALLBACK_PALETTE } from "../../../styles/colors";

type TopProjectsCardProps = {
  topProjects: TopProjectStat[];
  isLoading: boolean;
};

function resolveColor(project: TopProjectStat, index: number): string {
  return project.color ?? CHART_FALLBACK_PALETTE[index % CHART_FALLBACK_PALETTE.length];
}

function RowSkeleton() {
  return (
    <Box sx={{ py: 1.75 }}>
      <Stack direction="row" alignItems="center" spacing={1.5}>
        <Skeleton variant="circular" width={10} height={10} sx={{ flexShrink: 0 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Skeleton variant="text" width="60%" height={20} />
          <Skeleton variant="rectangular" width="100%" height={3} sx={{ mt: 0.75, borderRadius: 999 }} />
        </Box>
        <Skeleton variant="text" width={40} height={20} />
      </Stack>
    </Box>
  );
}

export default function TopProjectsCard({ topProjects, isLoading }: TopProjectsCardProps) {
  const maxHours = topProjects[0]?.hours ?? 1;

  return (
    <Paper
      variant="outlined"
      sx={{ ...dashboardGlassCardSx, ...dashboardSectionCardPaddingSx, height: "100%" }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography
          sx={{
            fontSize: { xs: "1.1rem", md: "1.15rem" },
            fontWeight: 700,
            letterSpacing: "-0.02em",
          }}
        >
          Top projects
        </Typography>
        <Typography sx={{ fontSize: "0.875rem", fontWeight: 600, color: "text.disabled" }}>
          This week
        </Typography>
      </Stack>

      {isLoading ? (
        <Stack divider={<Divider />} spacing={0}>
          <RowSkeleton />
          <RowSkeleton />
          <RowSkeleton />
        </Stack>
      ) : topProjects.length === 0 ? (
        <Typography sx={{ fontSize: "0.875rem", color: "text.secondary" }}>
          No projects logged this week
        </Typography>
      ) : (
        <Stack divider={<Divider />} spacing={0}>
          {topProjects.map((project, index) => {
            const color = resolveColor(project, index);
            const barPct = (project.hours / maxHours) * 100;

            return (
              <Box key={project.id} sx={{ py: 1.75 }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: color,
                      flexShrink: 0,
                    }}
                  />
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                      sx={{
                        fontSize: "0.9375rem",
                        fontWeight: 500,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        lineHeight: 1.3,
                      }}
                    >
                      {project.name}
                    </Typography>
                    <Box
                      sx={{
                        mt: 0.75,
                        height: 3,
                        borderRadius: 999,
                        bgcolor: alpha(color, 0.15),
                        overflow: "hidden",
                      }}
                    >
                      <Box
                        sx={{
                          width: `${barPct}%`,
                          height: "100%",
                          bgcolor: color,
                          borderRadius: 999,
                        }}
                      />
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      fontSize: "0.9375rem",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      flexShrink: 0,
                    }}
                  >
                    {formatHM(project.hours)}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Stack>
      )}
    </Paper>
  );
}
