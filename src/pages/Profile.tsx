import { EmailOutlined, PersonOutlineRounded } from "@mui/icons-material";
import { Avatar, Box, Chip, Paper, Stack, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useAuth } from "../hooks/useAuth";

function getInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) return "AJ";

  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "AJ";
}

export default function Profile() {
  const theme = useTheme();
  const { user } = useAuth();
  const profileName = user?.displayName?.trim() || "Alex Johnson";
  const profileEmail = user?.email?.trim() || "alex.johnson@example.com";

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: 5,
          borderColor: "divider",
          backgroundImage:
            "radial-gradient(circle at top right, rgba(112,87,246,0.14), transparent 26%), linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.98) 100%)",
        }}
      >
        <Stack direction={{ xs: "column", md: "row" }} spacing={3} alignItems={{ xs: "flex-start", md: "center" }} justifyContent="space-between">
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5} alignItems={{ xs: "flex-start", sm: "center" }}>
            <Avatar
              sx={{
                width: 78,
                height: 78,
                bgcolor: "primary.main",
                fontSize: "1.35rem",
                fontWeight: 600,
                boxShadow: "0 18px 32px rgba(112, 87, 246, 0.22)",
              }}
            >
              {getInitials(profileName)}
            </Avatar>
            <Box>
              <Chip
                icon={<PersonOutlineRounded sx={{ fontSize: 16 }} />}
                label="Profile"
                size="small"
                sx={{
                  mb: 1.1,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: "primary.main",
                  border: "1px solid rgba(112,87,246,0.1)",
                }}
              />
              <Typography variant="h2">{profileName}</Typography>
              <Typography variant="body1" sx={{ color: "text.secondary", mt: 0.6 }}>
                Account details and personal information.
              </Typography>
            </Box>
          </Stack>

          <Chip label="Account" variant="outlined" />
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
          mt: 2.5,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.75, borderRadius: 5, borderColor: "divider" }}>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mb: 1.75 }}>
            Account information
          </Typography>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 0.4 }}>
                Full name
              </Typography>
              <Typography variant="h3">{profileName}</Typography>
            </Box>
            <Box>
              <Typography variant="caption" sx={{ display: "block", mb: 0.4 }}>
                Email
              </Typography>
              <Stack direction="row" spacing={1} alignItems="center">
                <EmailOutlined sx={{ fontSize: 18, color: "text.secondary" }} />
                <Typography variant="body1">{profileEmail}</Typography>
              </Stack>
            </Box>
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.75,
            borderRadius: 5,
            borderColor: "divider",
            backgroundImage: "linear-gradient(180deg, rgba(112,87,246,0.05) 0%, rgba(112,87,246,0.01) 100%)",
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mb: 1.75 }}>
            Preferences
          </Typography>
          <Stack spacing={1.25}>
            <Chip label="Avatar" variant="outlined" sx={{ justifyContent: "flex-start" }} />
            <Chip label="Personal details" variant="outlined" sx={{ justifyContent: "flex-start" }} />
            <Chip label="Work preferences" variant="outlined" sx={{ justifyContent: "flex-start" }} />
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
}
