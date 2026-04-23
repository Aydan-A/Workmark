export const dashboardFocusVisibleSx = {
  "&:focus-visible": {
    outline: "2px solid rgba(108,99,255,0.42)",
    outlineOffset: 2,
  },
};

export const dashboardGlassCardSx = {
  borderRadius: "24px",
  bgcolor: "rgba(255,255,255,0.55)",
  backdropFilter: "blur(20px)",
  borderColor: "rgba(255,255,255,0.8)",
  boxShadow: "0 8px 32px rgba(108,99,255,0.08)",
};

export const dashboardInteractiveHoverSx = {
  boxShadow: "0 12px 36px rgba(108,99,255,0.12)",
  borderColor: "rgba(108,99,255,0.18)",
  backgroundColor: "rgba(255,255,255,0.62)",
};

export const dashboardInteractiveActiveSx = {
  transform: "translateY(1px)",
  boxShadow: "0 8px 24px rgba(108,99,255,0.1)",
};

export const dashboardInteractiveCardSx = {
  ...dashboardGlassCardSx,
  transition:
    "transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease, background-color 160ms ease",
  "&:hover": dashboardInteractiveHoverSx,
  "&:active": dashboardInteractiveActiveSx,
};

export const dashboardCardTitleSx = {
  fontSize: { xs: "1.2rem", md: "1.3rem" },
  fontWeight: 600,
  letterSpacing: "-0.01em",
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

export const dashboardCardSubtitleSx = {
  mt: 0.45,
  color: "text.secondary",
  fontWeight: 500,
  fontFamily: "'Plus Jakarta Sans', sans-serif",
};

export const dashboardSectionCardPaddingSx = {
  p: { xs: 2.5, md: 3 },
};
