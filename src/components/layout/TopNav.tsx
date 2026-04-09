import { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../firebase/auth";
import { useAuth } from "../../hooks/useAuth";

const navButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 999,
  color: "#1f2340",
  px: 1.6,
  py: 0.9,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  letterSpacing: "-0.01em",
};

const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: "none",
  borderRadius: 999,
  backgroundColor: isActive ? "rgba(112, 87, 246, 0.1)" : "transparent",
  border: isActive ? "1px solid rgba(112, 87, 246, 0.12)" : "1px solid transparent",
});

function getInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) return "AJ";

  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "AJ";
}

export default function TopNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const profileName = user?.displayName?.trim() || "Alex Johnson";
  const profileInitials = useMemo(() => getInitials(profileName), [profileName]);

  const handleSignOut = async () => {
    if (isSigningOut) return;
    setIsSigningOut(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "rgba(252,251,255,0.76)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(124, 106, 214, 0.12)",
        color: "text.primary",
      }}
    >
      <Toolbar sx={{ px: { xs: 2, md: 3 } }}>
        <Box
          sx={{
            width: "100%",
            maxWidth: 1240,
            mx: "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
            py: 0.5,
          }}
        >
          <NavLink to="/" style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{
                  width: 46,
                  height: 46,
                  borderRadius: 3,
                  display: "grid",
                  placeItems: "center",
                  bgcolor: alpha("#7057f6", 0.12),
                  color: "primary.main",
                  boxShadow: "inset 0 0 0 1px rgba(112, 87, 246, 0.08)",
                }}
              >
                <WorkOutlineIcon />
              </Box>
              <Box>
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    color: "text.secondary",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                    fontWeight: 500,
                  }}
                >
                  Worklog
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    color: "text.primary",
                    fontWeight: 700,
                    lineHeight: 1.1,
                    letterSpacing: "-0.025em",
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  Daily Work Log
                </Typography>
              </Box>
            </Box>
          </NavLink>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: { xs: "center", md: "flex-end" },
              gap: 1,
              flexWrap: "wrap",
              flex: 1,
              minWidth: { xs: "100%", md: 0 },
            }}
          >
            <NavLink to="/today" style={getNavLinkStyle}>
              <Button startIcon={<EditCalendarRoundedIcon />} sx={navButtonSx}>
                Log Today
              </Button>
            </NavLink>

            <NavLink to="/weekly" style={getNavLinkStyle}>
              <Button startIcon={<TimelineRoundedIcon />} sx={navButtonSx}>
                Weekly Log
              </Button>
            </NavLink>

            <NavLink to="/calendar" style={getNavLinkStyle}>
              <Button startIcon={<DateRangeRoundedIcon />} sx={navButtonSx}>
                Calendar
              </Button>
            </NavLink>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                pl: { xs: 0, md: 1.25 },
                ml: { xs: 0, md: 0.75 },
                borderLeft: { xs: "none", md: "1px solid rgba(124, 106, 214, 0.12)" },
              }}
            >
              <NavLink to="/profile" style={{ textDecoration: "none" }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.1,
                    px: 1.1,
                    py: 0.65,
                    borderRadius: 999,
                    border: "1px solid rgba(124, 106, 214, 0.1)",
                    bgcolor: "rgba(255,255,255,0.62)",
                    transition: "background-color 120ms ease, border-color 120ms ease, transform 120ms ease",
                    "&:hover": {
                      bgcolor: "rgba(112, 87, 246, 0.08)",
                      borderColor: "rgba(112, 87, 246, 0.18)",
                      transform: "translateY(-1px)",
                    },
                  }}
                >
                  <Avatar sx={{ width: 38, height: 38, bgcolor: "primary.main", fontWeight: 600, boxShadow: "0 10px 20px rgba(112, 87, 246, 0.22)" }}>
                    {profileInitials}
                  </Avatar>
                  <Box sx={{ display: { xs: "none", sm: "block" } }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        color: "text.secondary",
                        lineHeight: 1.2,
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      Signed in as
                    </Typography>
                    <Typography
                      sx={{
                        color: "text.primary",
                        fontWeight: 600,
                        lineHeight: 1.25,
                        letterSpacing: "-0.015em",
                        fontFamily: "'Plus Jakarta Sans', sans-serif",
                      }}
                    >
                      {profileName}
                    </Typography>
                  </Box>
                </Box>
              </NavLink>
              <Button onClick={handleSignOut} disabled={isSigningOut} sx={{ ...navButtonSx, minWidth: 0, px: 1.2 }}>
                <LogoutIcon fontSize="small" />
              </Button>
            </Box>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
