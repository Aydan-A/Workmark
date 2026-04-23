import { Box, Container } from "@mui/material";
import TopNav from "./TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const grainTexture = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='240' height='240' viewBox='0 0 240 240'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.05' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='240' height='240' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`;

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "#F0EEFF",
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          background: "transparent",
        },
        "&::after": {
          content: '""',
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 0,
          opacity: 0.04,
          backgroundImage: grainTexture,
          backgroundRepeat: "repeat",
          backgroundSize: "240px 240px",
        },
      }}
    >
      <TopNav />

      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          zIndex: 1,
          pt: { xs: 12, md: 13 },
          pb: { xs: 3, md: 4 },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1240 }}>{children}</Box>
      </Container>
    </Box>
  );
}
