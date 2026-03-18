import { Box, Container } from "@mui/material";
import TopNav from "./TopNav";

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "background.default",
        backgroundImage:
          "radial-gradient(circle at top left, rgba(124, 92, 255, 0.12), transparent 24%), linear-gradient(180deg, #fbfaff 0%, #f6f4fd 100%)",
      }}
    >
      <TopNav />

      <Container maxWidth={false} sx={{ py: { xs: 3, md: 4 }, display: "flex", justifyContent: "center" }}>
        <Box sx={{ width: "100%", maxWidth: 1240 }}>{children}</Box>
      </Container>
    </Box>
  );
}
