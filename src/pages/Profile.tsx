import { Avatar, Box, Paper, Stack, Typography } from "@mui/material";
import { useAuth } from "../hooks/useAuth";

function getInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) return "AJ";

  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "AJ";
}

export default function Profile() {
  const { user } = useAuth();
  const profileName = user?.displayName?.trim() || "Alex Johnson";
  const profileEmail = user?.email?.trim() || "alex.johnson@example.com";

  return (
    <Box>
      <Typography variant="h2">Profile</Typography>
      <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.75 }}>
        This is the placeholder page for user profile.
      </Typography>

      <Paper variant="outlined" sx={{ mt: 3, p: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", sm: "center" }}>
          <Avatar sx={{ width: 64, height: 64, bgcolor: "primary.main", fontSize: "1.1rem", fontWeight: 600 }}>
            {getInitials(profileName)}
          </Avatar>
          <Box>
            <Typography variant="h3">{profileName}</Typography>
            <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.5 }}>
              {profileEmail}
            </Typography>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
}
