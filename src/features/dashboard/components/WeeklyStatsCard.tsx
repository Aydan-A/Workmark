import type { ReactNode } from "react";
import BoltRounded from "@mui/icons-material/BoltRounded";
import HomeWorkRounded from "@mui/icons-material/HomeWorkRounded";
import TrendingUpRounded from "@mui/icons-material/TrendingUpRounded";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { dashboardGlassCardSx } from "../../../styles/dashboard";
import { formatHM, formatPct } from "../dashboard.utils";
import { SparklineBars, SparklineDots, SparklineLine } from "./Sparkline";

type WeeklyStatsCardProps = {
  weeklyTotal: number;
  weeklyDelta: number;
  remoteHours: number;
  remotePct: number;
  streakDays: number;
  last7DaysHours: number[];
  last7DaysRemotePct: number[];
  last14DaysLogged: boolean[];
  isLoading: boolean;
};

const labelSx = {
  fontSize: "0.6875rem",
  fontWeight: 600,
  letterSpacing: "0.1em",
  textTransform: "uppercase" as const,
  color: "text.disabled",
};

const valueSx = {
  fontSize: "2rem",
  fontWeight: 700,
  lineHeight: 1.15,
  color: "text.primary",
  letterSpacing: "-0.03em",
  fontVariantNumeric: "tabular-nums",
  mt: 1,
};

const sublineSx = {
  fontSize: "0.8125rem",
  color: "text.secondary",
  mt: 0.5,
  fontVariantNumeric: "tabular-nums",
};

function DeltaSubline({ delta }: { delta: number }) {
  if (delta === 0) return <Typography sx={sublineSx}>Same as last week</Typography>;
  const positive = delta > 0;
  return (
    <Typography sx={{ ...sublineSx, color: positive ? "success.main" : "error.main" }}>
      {positive ? "▲" : "▼"} {formatHM(Math.abs(delta))} vs last week
    </Typography>
  );
}

function TileSkeleton() {
  return (
    <>
      <Skeleton variant="text" width={80} height={48} sx={{ mt: 1 }} />
      <Skeleton variant="text" width={100} height={20} />
      <Box sx={{ mt: "auto", pt: 2 }}>
        <Skeleton variant="rectangular" height={36} sx={{ borderRadius: 1 }} />
      </Box>
    </>
  );
}

type StatTileProps = {
  label: string;
  icon: ReactNode;
  isLoading: boolean;
  sparkline: ReactNode;
  children: ReactNode;
};

function StatTile({ label, icon, isLoading, sparkline, children }: StatTileProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        ...dashboardGlassCardSx,
        p: { xs: 2, md: 2.5 },
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Typography sx={labelSx}>{label}</Typography>
        <Box sx={{ color: "primary.main", opacity: 0.4, display: "flex" }}>{icon}</Box>
      </Stack>

      {isLoading ? (
        <TileSkeleton />
      ) : (
        <>
          {children}
          <Box sx={{ mt: "auto", pt: 2 }}>{sparkline}</Box>
        </>
      )}
    </Paper>
  );
}

export default function WeeklyStatsCard({
  weeklyTotal,
  weeklyDelta,
  remoteHours,
  remotePct,
  streakDays,
  last7DaysHours,
  last7DaysRemotePct,
  last14DaysLogged,
  isLoading,
}: WeeklyStatsCardProps) {
  const streakSubline =
    streakDays === 0 ? "Start one" : `${streakDays === 1 ? "day" : "days"} streak`;
  const remoteSubline = remotePct === 0 ? "No remote hours" : `${formatHM(remoteHours)} remote`;

  return (
    <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ height: "100%" }}>
      <StatTile
        label="This week"
        icon={<TrendingUpRounded sx={{ fontSize: "1rem" }} />}
        isLoading={isLoading}
        sparkline={<SparklineLine data={last7DaysHours} />}
      >
        <Typography sx={valueSx}>{formatHM(weeklyTotal)}</Typography>
        <DeltaSubline delta={weeklyDelta} />
      </StatTile>

      <StatTile
        label="Remote"
        icon={<HomeWorkRounded sx={{ fontSize: "1rem" }} />}
        isLoading={isLoading}
        sparkline={<SparklineBars data={last7DaysRemotePct} />}
      >
        <Typography sx={valueSx}>{formatPct(remotePct)}</Typography>
        <Typography sx={sublineSx}>{remoteSubline}</Typography>
      </StatTile>

      <StatTile
        label="Streak"
        icon={<BoltRounded sx={{ fontSize: "1rem" }} />}
        isLoading={isLoading}
        sparkline={<SparklineDots data={last14DaysLogged} />}
      >
        <Typography sx={valueSx}>{streakDays}</Typography>
        <Typography sx={sublineSx}>{streakSubline}</Typography>
      </StatTile>
    </Stack>
  );
}
