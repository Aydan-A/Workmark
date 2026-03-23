import { useMemo, useState } from "react";
import {
  AppBar,
  Avatar,
  Box,
  Button,
  Toolbar,
  Typography,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../firebase/auth";
import { useAuth } from "../../hooks/useAuth";

const navButtonSx = {
  textTransform: "none",
  fontWeight: 500,
  borderRadius: 99,
  color: "#1f2340",
  px: 1.5,
};

const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  textDecoration: "none",
  borderRadius: 999,
  backgroundColor: isActive ? "rgba(112, 87, 246, 0.12)" : "transparent",
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
        bgcolor: "rgba(255,255,255,0.88)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid #ece7fb",
        color: "text.primary",
      }}
    >
      <Toolbar
        sx={{
          gap: 2,
          flexWrap: "wrap",
          justifyContent: "space-between",
          py: 1.25,
        }}
      >
        <NavLink to="/" style={{ textDecoration: "none" }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Box
              sx={{
                width: 42,
                height: 42,
                borderRadius: 2.5,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(112, 87, 246, 0.1)",
                color: "primary.main",
              }}
            >
              <WorkOutlineIcon />
            </Box>
            <Typography variant="h6" sx={{ color: "text.primary", fontWeight: 600 }}>
              Daily Work Log
            </Typography>
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
            <Button startIcon={<TodayIcon />} sx={navButtonSx}>
              Log Today
            </Button>
          </NavLink>

          <NavLink to="/weekly" style={getNavLinkStyle}>
            <Button startIcon={<ViewWeekIcon />} sx={navButtonSx}>
              Weekly Log
            </Button>
          </NavLink>

          <NavLink to="/calendar" style={getNavLinkStyle}>
            <Button startIcon={<CalendarMonthIcon />} sx={navButtonSx}>
              Calendar
            </Button>
          </NavLink>

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              pl: { xs: 0, md: 1 },
              ml: { xs: 0, md: 1 },
              borderLeft: { xs: "none", md: "1px solid #ece7fb" },
            }}
          >
            <NavLink to="/profile" style={{ textDecoration: "none" }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.5,
                  borderRadius: 999,
                  transition: "background-color 120ms ease",
                  "&:hover": {
                    bgcolor: "rgba(112, 87, 246, 0.08)",
                  },
                }}
              >
                <Avatar sx={{ width: 38, height: 38, bgcolor: "primary.main", fontWeight: 600 }}>
                  {profileInitials}
                </Avatar>
                <Typography sx={{ color: "text.primary", fontWeight: 500 }}>{profileName}</Typography>
              </Box>
            </NavLink>
            <Button onClick={handleSignOut} disabled={isSigningOut} sx={{ ...navButtonSx, minWidth: 0 }}>
              <LogoutIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
