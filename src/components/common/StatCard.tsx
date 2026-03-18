import type { ReactNode } from "react";
import { Box, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
};

export default function StatCard({ icon, label, value, suffix }: StatCardProps) {
  const theme = useTheme();

  return (
    <Paper
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 4,
        bgcolor: "background.paper",
        borderColor: "divider",
        minHeight: 176,
      }}
    >
      <Box
        sx={{
          width: 44,
          height: 44,
          borderRadius: 2.5,
          display: "grid",
          placeItems: "center",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
        }}
      >
        {icon}
      </Box>

      <Typography variant="subtitle1" sx={{ mt: 2, color: "text.secondary" }}>
        {label}
      </Typography>

      <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mt: 1.5 }}>
        <Typography
          variant="h3"
          sx={{
            fontSize: { xs: "2rem", md: "2.2rem" },
            letterSpacing: "-0.03em",
          }}
        >
          {value}
        </Typography>
        {suffix ? (
          <Typography variant="h6" sx={{ color: "text.secondary", fontWeight: 500 }}>
            {suffix}
          </Typography>
        ) : null}
      </Box>
    </Paper>
  );
}
