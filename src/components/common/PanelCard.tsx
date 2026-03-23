import type { ReactNode } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

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
        p: { xs: 2.5, md: 3 },
        borderRadius: 5,
        bgcolor: "background.paper",
        borderColor: "divider",
        height: "100%",
        backgroundImage:
          "linear-gradient(180deg, rgba(255,255,255,0.84) 0%, rgba(255,255,255,0.96) 100%)",
      }}
    >
      <Box
        sx={{
          position: "relative",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 58,
          mb: 3,
          textAlign: "center",
        }}
      >
        <Box>
          <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "1.6rem" } }}>
            {title}
          </Typography>
          {subtitle ? (
            <Typography variant="body2" sx={{ mt: 0.5, color: "text.secondary" }}>
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
              fontWeight: 500,
              position: "absolute",
              right: 0,
              top: "50%",
              transform: "translateY(-50%)",
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
