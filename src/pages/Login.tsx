import { useMemo, useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Link,
  Divider,
  IconButton,
  InputAdornment,
  Alert,
} from "@mui/material";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { signInWithDemo } from "../features/auth/session";

// Login page UI (no Firebase yet).
// Goal: match the Figma "Daily Work Log" sign-in card layout.
export default function Login() {
  const navigate = useNavigate();

  // Local form state for email and password fields.
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Small UX helpers.
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Demo credentials.
  const demoEmail = "alex@example.com";
  const demoPassword = "password123";

  // Disable Sign In until basic fields exist (UI-only validation).
  const canSubmit = useMemo(() => email.trim() !== "" && password !== "", [email, password]);

  const handleFillDemo = () => {
    // Fill the form with demo credentials for quick testing.
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError(null);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!canSubmit) return;

    const ok = signInWithDemo(email, password);
    if (!ok) {
      setError("Invalid credentials. Use the demo account shown below.");
      return;
    }

    setError(null);
    navigate("/today", { replace: true });
  };

  return (
    // Full-page center layout (matches your screenshot).
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f7f8fb",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: 460 }}>
        {/* Logo */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: "#4f46e5",
              display: "grid",
              placeItems: "center",
              boxShadow: "0 10px 30px rgba(79, 70, 229, 0.25)",
            }}
          >
            <WorkOutlineIcon sx={{ color: "white", fontSize: 26 }} />
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h3" align="center" sx={{ fontWeight: 800 }}>
          Daily Work Log
        </Typography>
        <Typography variant="body2" align="center" sx={{ color: "#6b7280", mt: 0.5, mb: 3 }}>
          Sign in to your account
        </Typography>

        {/* Card */}
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 4,
            border: "1px solid #e5e7eb",
            bgcolor: "white",
          }}
        >
          {/* Error banner (placeholder for auth errors) */}
          {error && (
            <Alert severity="info" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
            {/* Email */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword((v) => !v)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {/* Sign in button */}
            <Button
              type="submit"
              variant="contained"
              disabled={!canSubmit}
              sx={{
                mt: 0.5,
                bgcolor: "#4f46e5",
                "&:hover": { bgcolor: "#4338ca" },
                py: 1.2,
                borderRadius: 3,
                fontWeight: 700,
              }}
            >
              Sign In
            </Button>

            {/* Demo block */}
            <Box
              sx={{
                mt: 0.5,
                border: "1px solid #e5e7eb",
                borderRadius: 3,
                p: 1.5,
                bgcolor: "#fafafa",
              }}
            >
              <Typography variant="body2" sx={{ color: "#374151" }}>
                Demo account: {demoEmail} / {demoPassword} —{" "}
                <Link component="button" onClick={handleFillDemo} underline="hover">
                  fill in
                </Link>
              </Typography>
            </Box>

            <Divider sx={{ my: 0.5 }} />

            {/* Footer link */}
            <Typography variant="body2" align="center" sx={{ color: "#6b7280" }}>
              Don't have an account?{" "}
              <Link href="#" underline="hover" sx={{ fontWeight: 700 }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
