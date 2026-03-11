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
import { signIn, signUp, getAuthErrorMessage } from "../firebase/auth";

// Auth page UI for sign-in/sign-up flows.
// Goal: match the "Daily Work Log" card layout while keeping the form focused.
export default function Login() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signIn" | "signUp">("signIn");

  // Local form state for email and password fields.
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Small UX helpers.
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Disable submit until basic fields exist.
  const canSubmit = useMemo(() => {
    if (mode === "signUp") {
      return fullName.trim() !== "" && email.trim() !== "" && password !== "" && confirmPassword !== "";
    }
    return email.trim() !== "" && password !== "";
  }, [mode, fullName, email, password, confirmPassword]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!canSubmit) {
      setError(
        mode === "signUp"
          ? "Please enter full name, email, password, and confirm password."
          : "Please enter both email and password.",
      );
      return;
    }

    if (mode === "signUp" && fullName.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }

    if (mode === "signUp" && password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      if (mode === "signUp") {
        await signUp(email.trim(), password, fullName.trim());
      } else {
        await signIn(email.trim(), password);
      }
      setError(null);
      navigate("/today", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, mode));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleMode = () => {
    setMode((prev) => (prev === "signIn" ? "signUp" : "signIn"));
    setError(null);
    setFullName("");
    setPassword("");
    setConfirmPassword("");
    setShowPassword(false);
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
          {mode === "signIn" ? "Sign in to your account" : "Create your account"}
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
            {mode === "signUp" && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Alex Johnson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  autoComplete="name"
                />
              </Box>
            )}

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
                helperText={mode === "signUp" ? "Use your work email so your logs stay tied to your account." : undefined}
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
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
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

            {mode === "signUp" && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.75 }}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </Box>
            )}

            {/* Sign in button */}
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                mt: 0.5,
                bgcolor: "#4f46e5",
                "&:hover": { bgcolor: "#4338ca" },
                py: 1.2,
                borderRadius: 3,
                fontWeight: 700,
              }}
            >
              {isSubmitting
                ? mode === "signIn"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "signIn"
                  ? "Sign In"
                  : "Sign Up"}
            </Button>

            <Divider sx={{ my: 0.5 }} />

            {/* Footer link */}
            <Typography variant="body2" align="center" sx={{ color: "#6b7280" }}>
              {mode === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link component="button" type="button" onClick={handleToggleMode} underline="hover" sx={{ fontWeight: 700 }}>
                {mode === "signIn" ? "Sign up" : "Sign in"}
              </Link>
            </Typography>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}
