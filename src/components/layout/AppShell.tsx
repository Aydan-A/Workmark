import { Box, Container } from "@mui/material";
import TopNav from "./TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(circle at top left, rgba(124, 92, 255, 0.18), transparent 26%), radial-gradient(circle at 85% 12%, rgba(126, 211, 255, 0.12), transparent 20%), linear-gradient(180deg, #fcfbff 0%, #f7f4ff 100%)",
        "&::before": {
          content: '\"\"',
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          backgroundImage:
            "linear-gradient(rgba(112, 87, 246, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(112, 87, 246, 0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          maskImage: "linear-gradient(180deg, rgba(0,0,0,0.7), transparent 76%)",
        },
      }}
    >
      <TopNav />

      <Container
        maxWidth={false}
        sx={{
          position: "relative",
          py: { xs: 3, md: 4 },
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: 1240 }}>{children}</Box>
      </Container>
    </Box>
  );
}
