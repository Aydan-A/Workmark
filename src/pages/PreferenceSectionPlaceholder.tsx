import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

type PreferenceSectionPlaceholderProps = {
  title: string;
  subtitle: string;
};

export default function PreferenceSectionPlaceholder({
  title,
  subtitle,
}: PreferenceSectionPlaceholderProps) {
  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2.5, md: 3.5 },
        borderRadius: "24px",
        borderColor: "rgba(255,255,255,0.8)",
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Button
            component={RouterLink}
            to="/profile"
            startIcon={<ArrowBackRoundedIcon />}
            color="inherit"
            sx={{
              px: 0,
              minWidth: 0,
              color: "text.secondary",
              mb: 1.5,
            }}
          >
            Back to profile
          </Button>

          <Typography variant="h2" sx={{ mb: 0.8 }}>
            {title}
          </Typography>
          <Typography variant="body1" sx={{ color: "text.secondary", maxWidth: 560 }}>
            {subtitle}
          </Typography>
        </Box>

        <Paper
          variant="outlined"
          sx={{
            p: 2.25,
            borderRadius: "20px",
            borderColor: "rgba(255,255,255,0.8)",
            bgcolor: "rgba(255,255,255,0.32)",
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 0.6 }}>
            Coming soon
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            This screen is routed and ready, but its inner controls have not been built yet.
          </Typography>
        </Paper>
      </Stack>
    </Paper>
  );
}
