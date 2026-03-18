import type { ReactNode } from "react";
import { Box, Button, Paper, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type PanelCardProps = {
  title: string;
  actionLabel?: string;
  actionTo?: string;
  children: ReactNode;
};

export default function PanelCard({ title, actionLabel, actionTo, children }: PanelCardProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.5, md: 3 },
        borderRadius: 4,
        bgcolor: "background.paper",
        borderColor: "divider",
        height: "100%",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", sm: "center" },
          justifyContent: "space-between",
          gap: 1.5,
          mb: 3,
        }}
      >
        <Typography variant="h2" sx={{ fontSize: { xs: "1.35rem", md: "1.55rem" } }}>
          {title}
        </Typography>

        {actionLabel && actionTo ? (
          <Button
            component={RouterLink}
            to={actionTo}
            color="primary"
            sx={{ px: 0, minWidth: 0, fontWeight: 500 }}
          >
            {actionLabel}
          </Button>
        ) : null}
      </Box>

      {children}
    </Paper>
  );
}
