import type { ReactNode } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import {
  dashboardCardSubtitleSx,
  dashboardCardTitleSx,
  dashboardFocusVisibleSx,
  dashboardGlassCardSx,
  dashboardSectionCardPaddingSx,
} from "../../styles/dashboard";

type PanelCardProps = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionTo?: string;
  children: ReactNode;
};

export default function PanelCard({ title, subtitle, actionLabel, actionTo, children }: PanelCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        ...dashboardSectionCardPaddingSx,
        ...dashboardGlassCardSx,
        height: "100%",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 54,
          mb: 2.35,
          textAlign: "center",
        }}
      >
        <Box>
          <Typography
            variant="h2"
            sx={dashboardCardTitleSx}
          >
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={dashboardCardSubtitleSx}>
              {subtitle}
            </Typography>
          ) : null}
        </Box>

        {actionLabel && actionTo ? (
          <Button
            component={RouterLink}
            to={actionTo}
            color="primary"
            sx={{
              px: 0,
              minWidth: 0,
              fontWeight: 600,
              letterSpacing: "-0.01em",
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
              ...dashboardFocusVisibleSx,
            }}
          >
            {actionLabel}
          </Button>
        ) : null}
      </Box>

      {children}
    </Paper>
  );
}
