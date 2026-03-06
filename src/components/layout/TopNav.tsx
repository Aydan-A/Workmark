import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Button,
  Avatar,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import TodayIcon from "@mui/icons-material/Today";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ViewWeekIcon from "@mui/icons-material/ViewWeek";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";
import { signOut } from "../../features/auth/session";

// Shared static styles for nav buttons.
// This part does NOT depend on route state.
const navButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 2,
  color: "#111827",
};

// React Router style callback.
// This DOES receive isActive, because it belongs to NavLink.
const getNavLinkStyle = ({ isActive }: { isActive: boolean }) => ({
  // Remove default link underline
  textDecoration: "none",

  // Highlight the active route
  backgroundColor: isActive ? "rgba(79, 70, 229, 0.12)" : "transparent",

  // Make the wrapper match the button's rounded corners
  borderRadius: "8px",
});

export default function TopNav() {
  const navigate = useNavigate();

  const handleSignOut = () => {
    signOut();
    navigate("/login", { replace: true });
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: "white",
        borderBottom: "1px solid #eee",
      }}
    >
      <Toolbar sx={{ gap: 2 }}>
        {/* Brand area */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <WorkOutlineIcon sx={{ color: "#4f46e5" }} />
          <Typography
            variant="h6"
            sx={{ color: "#111827", fontWeight: 800 }}
          >
            Daily Work Log
          </Typography>
        </Box>

        {/* Push navigation to the right */}
        <Box sx={{ flex: 1 }} />

        {/* Each NavLink handles active route styling */}
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

        {/* User info */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Avatar sx={{ width: 34, height: 34, bgcolor: "#4f46e5" }}>
            AJ
          </Avatar>
          <Typography sx={{ color: "#111827", fontWeight: 600 }}>
            Alex Johnson
          </Typography>
          <Button
            startIcon={<LogoutIcon />}
            onClick={handleSignOut}
            sx={{ ...navButtonSx, ml: 1 }}
          >
            Sign Out
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
