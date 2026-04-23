import { useMemo, useState } from "react";
import { Avatar, Box, Button, Typography } from "@mui/material";
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
  px: 2,
  py: 0.75,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  letterSpacing: "-0.01em",
  minWidth: 0,
  transition: "background-color 140ms ease, color 140ms ease",
};

const navItems = [
  { to: "/today", label: "Log Today", icon: <EditCalendarRoundedIcon /> },
  { to: "/weekly", label: "Weekly Log", icon: <TimelineRoundedIcon /> },
  { to: "/calendar", label: "Calendar", icon: <DateRangeRoundedIcon /> },
];

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
    <Box
      sx={{
        position: "fixed",
        top: 16,
        left: 16,
        right: 16,
        zIndex: 1200,
        display: "flex",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 780,
          pointerEvents: "auto",
          px: { xs: 1.25, sm: 1.5 },
          py: { xs: 1, sm: 1.15 },
          display: "grid",
          gridTemplateColumns: { xs: "auto 1fr auto", md: "auto 1fr auto" },
          alignItems: "center",
          gap: { xs: 1, sm: 1.5 },
          bgcolor: "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255,255,255,0.9)",
          borderRadius: "999px",
          boxShadow: "0 4px 24px rgba(108,99,255,0.10)",
        }}
      >
        <NavLink to="/" style={{ textDecoration: "none", minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.1, minWidth: 0 }}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: "999px",
                display: "grid",
                placeItems: "center",
                bgcolor: alpha("#6C63FF", 0.14),
                color: "#6C63FF",
              }}
            >
              <WorkOutlineIcon fontSize="small" />
            </Box>
            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                color: "#1F2340",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              Worklog
            </Typography>
          </Box>
        </NavLink>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: { xs: 0.25, sm: 0.5 },
            minWidth: 0,
            overflowX: "auto",
            scrollbarWidth: "none",
            "&::-webkit-scrollbar": {
              display: "none",
            },
          }}
        >
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Button
                  sx={{
                    ...navButtonSx,
                    color: isActive ? "#FFFFFF" : "#8B8B9E",
                    bgcolor: isActive ? "#6C63FF" : "transparent",
                    "&:hover": {
                      bgcolor: isActive ? "#6C63FF" : "transparent",
                    },
                  }}
                >
                  {item.label}
                </Button>
              )}
            </NavLink>
          ))}
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", justifySelf: "end", gap: 0.75 }}>
          <NavLink to="/profile" style={{ textDecoration: "none", justifySelf: "end" }}>
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: "#6C63FF",
                color: "#FFFFFF",
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: "0 4px 14px rgba(108,99,255,0.18)",
              }}
            >
              {profileInitials}
            </Avatar>
          </NavLink>

          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            startIcon={<LogoutIcon fontSize="small" />}
            sx={{
              minWidth: 0,
              px: { xs: 1.1, sm: 1.35 },
              py: 0.75,
              borderRadius: 999,
              color: "#8B8B9E",
              bgcolor: "transparent",
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: "rgba(108,99,255,0.08)",
              },
            }}
          >
            Exit
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
