import { Container, Box } from "@mui/material";
import TopNav from "./TopNav";

// AppShell is the shared layout wrapper for authenticated pages.
// It keeps the app frame consistent while the page content changes.
export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    // Full-page background and minimum height
    <Box sx={{ minHeight: "100vh", bgcolor: "#f7f8fb" }}>
      {/* Persistent top navigation shown on all main app pages */}
      <TopNav />

      {/* Main content area with controlled max width and padding */}
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* This is where the current page gets rendered */}
        {children}
      </Container>
    </Box>
  );
}