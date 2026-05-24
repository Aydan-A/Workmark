import { useMemo, useState } from "react";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import EditCalendarRoundedIcon from "@mui/icons-material/EditCalendarRounded";
import DateRangeRoundedIcon from "@mui/icons-material/DateRangeRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import LogoutIcon from "@mui/icons-material/Logout";
import { NavLink, useNavigate } from "react-router-dom";
import { logout } from "../../firebase/auth";
import { useAuth } from "../../hooks/useAuth";
import { getInitials } from "../../utils/formatters";
import { BRAND_PURPLE, brandPurpleAlpha, whiteAlpha } from "../../styles/colors";

const navButtonSx = {
  textTransform: "none",
  fontWeight: 600,
  borderRadius: 999,
  px: { xs: 1, sm: 2 },
  py: 0.75,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  letterSpacing: "-0.01em",
  minWidth: 0,
  transition: "background-color 140ms ease, color 140ms ease",
  "& .MuiButton-startIcon": {
    margin: { xs: 0, sm: "0 8px 0 -4px" },
  },
};

const navItems = [
  { to: "/today", label: "Log Today", icon: <EditCalendarRoundedIcon /> },
  { to: "/weekly", label: "Weekly Log", icon: <TimelineRoundedIcon /> },
  { to: "/calendar", label: "Calendar", icon: <DateRangeRoundedIcon /> },
];

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
        top: { xs: "auto", sm: 16 },
        bottom: { xs: "max(12px, env(safe-area-inset-bottom))", sm: "auto" },
        left: { xs: 12, sm: 16 },
        right: { xs: 12, sm: 16 },
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
          bgcolor: whiteAlpha(0.7),
          backdropFilter: "blur(16px)",
          border: `1px solid ${whiteAlpha(0.9)}`,
          borderRadius: "999px",
          boxShadow: `0 4px 24px ${brandPurpleAlpha(0.1)}`,
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
                bgcolor: alpha(BRAND_PURPLE, 0.14),
                color: "primary.main",
              }}
            >
              <WorkOutlineIcon fontSize="small" />
            </Box>
            <Typography
              sx={{
                display: { xs: "none", sm: "block" },
                color: "ink.base",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                whiteSpace: "nowrap",
              }}
            >
              Workmark
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
                  startIcon={item.icon}
                  aria-label={item.label}
                  sx={{
                    ...navButtonSx,
                    color: isActive ? "common.white" : "ink.soft",
                    bgcolor: isActive ? "primary.main" : "transparent",
                    "&:hover": {
                      bgcolor: isActive ? "primary.main" : "transparent",
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{ display: { xs: "none", sm: "inline" } }}
                  >
                    {item.label}
                  </Box>
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
                bgcolor: "primary.main",
                color: "common.white",
                fontWeight: 700,
                fontSize: "0.9rem",
                boxShadow: `0 4px 14px ${brandPurpleAlpha(0.18)}`,
              }}
            >
              {profileInitials}
            </Avatar>
          </NavLink>

          <Button
            onClick={handleSignOut}
            disabled={isSigningOut}
            startIcon={<LogoutIcon fontSize="small" />}
            aria-label="Sign out"
            sx={{
              minWidth: 0,
              px: { xs: 1, sm: 1.35 },
              py: 0.75,
              borderRadius: 999,
              color: "ink.soft",
              bgcolor: "transparent",
              whiteSpace: "nowrap",
              "&:hover": {
                bgcolor: brandPurpleAlpha(0.08),
              },
              "& .MuiButton-startIcon": {
                margin: { xs: 0, sm: "0 8px 0 -4px" },
              },
            }}
          >
            <Box component="span" sx={{ display: { xs: "none", sm: "inline" } }}>
              Exit
            </Box>
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
