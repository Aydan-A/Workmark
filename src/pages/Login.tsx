import { useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import GoogleIcon from "@mui/icons-material/Google";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import LocalFireDepartmentIcon from "@mui/icons-material/LocalFireDepartment";
import BoltIcon from "@mui/icons-material/Bolt";
import { useNavigate } from "react-router-dom";
import { signIn, signUp, signInWithGoogle, sendPasswordReset, getAuthErrorMessage } from "../firebase/auth";
import ShineBorder from "../components/reactbits/ShineBorder";
import { AUTH, SHINE_GRADIENT, brandPurpleAlpha, whiteAlpha } from "../styles/colors";
import "./Login.css";

// Light palette — same blue accent as the landing, but on a soft surface.
const BG = AUTH.bg;
const CARD = AUTH.card;
const BLUE = AUTH.blue;
const BLUE_HOVER = AUTH.blueHover;
const INK = AUTH.ink;
const MUTED = AUTH.muted;
const FAINT = AUTH.faint;
const HAIRLINE = AUTH.hairline;
const HAIRLINE_STRONG = AUTH.hairlineStrong;
const FIELD_BG = AUTH.fieldBg;

const SHINE_COLORS = SHINE_GRADIENT;

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    bgcolor: FIELD_BG,
    color: INK,
    borderRadius: 2,
    "& fieldset": { borderColor: HAIRLINE },
    "&:hover fieldset": { borderColor: HAIRLINE_STRONG },
    "&.Mui-focused fieldset": { borderColor: BLUE, borderWidth: "1px" },
  },
  "& .MuiOutlinedInput-input": { color: INK },
  "& .MuiOutlinedInput-input::placeholder": { color: FAINT, opacity: 1 },
  "& .MuiFormHelperText-root": { color: MUTED },
  "& .MuiSvgIcon-root": { color: MUTED },
};

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
  const [submitMethod, setSubmitMethod] = useState<"password" | "google" | null>(null);
  const isSubmitting = submitMethod !== null;

  const [resetOpen, setResetOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetStatus, setResetStatus] = useState<"idle" | "sending" | "sent">("idle");

  const openResetDialog = () => {
    setResetEmail(email.trim());
    setResetError(null);
    setResetStatus("idle");
    setResetOpen(true);
  };

  const closeResetDialog = () => {
    if (resetStatus === "sending") return;
    setResetOpen(false);
  };

  const handleSendReset = async () => {
    const target = resetEmail.trim();
    if (!target) {
      setResetError("Please enter your email address.");
      return;
    }
    try {
      setResetStatus("sending");
      setResetError(null);
      await sendPasswordReset(target);
      setResetStatus("sent");
    } catch (err) {
      setResetStatus("idle");
      setResetError(getAuthErrorMessage(err, "reset"));
    }
  };

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
      setSubmitMethod("password");
      if (mode === "signUp") {
        await signUp(email.trim(), password, fullName.trim());
      } else {
        await signIn(email.trim(), password);
      }
      setError(null);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, mode));
    } finally {
      setSubmitMethod(null);
    }
  };

  const handleGoogleAuth = async () => {
    if (isSubmitting) return;

    try {
      setSubmitMethod("google");
      await signInWithGoogle();
      setError(null);
      navigate("/", { replace: true });
    } catch (err) {
      setError(getAuthErrorMessage(err, "google"));
    } finally {
      setSubmitMethod(null);
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
    // Split-screen auth: branding aside on the left, focused form on the right.
    <Box
      className="auth-page"
      sx={{
        minHeight: "100vh",
        bgcolor: BG,
        color: INK,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        px: { xs: 2, md: "6vw" },
        py: 6,
      }}
    >
      <Box className="auth-grid">
        {/* Left aside — visual: tilted mockup card with floating decorative pills.
            Branding on the right column, so no name/logo here. */}
        <Box className="auth-aside" aria-hidden>
          {/* Decorative blob behind the mockup */}
          <span className="auth-blob auth-blob-a" />
          <span className="auth-blob auth-blob-b" />

          {/* Floating "streak" pill */}
          <Box className="auth-float auth-float-streak">
            <LocalFireDepartmentIcon sx={{ fontSize: 16, color: SHINE_GRADIENT[1] }} />
            <span><b>12</b> day streak</span>
          </Box>

          {/* Floating "remote" pill */}
          <Box className="auth-float auth-float-remote">
            <BoltIcon sx={{ fontSize: 16, color: SHINE_GRADIENT[0] }} />
            <span><b>82%</b> remote</span>
          </Box>

          {/* Tilted mock card */}
          <Box className="auth-mock">
            <Box className="auth-mock-head">
              <span className="auth-mock-dot is-a" />
              <span className="auth-mock-dot" />
              <span className="auth-mock-dot" />
              <span className="auth-mock-title">Today · Tuesday</span>
            </Box>

            <Box className="auth-mock-row">
              <span className="auth-mock-time">09:12</span>
              <span className="auth-mock-text">Standup — sprint kickoff, blockers cleared.</span>
            </Box>
            <Box className="auth-mock-row">
              <span className="auth-mock-time">10:40</span>
              <span className="auth-mock-text">Drafted onboarding email with the design team.</span>
            </Box>
            <Box className="auth-mock-row">
              <span className="auth-mock-time">13:05</span>
              <span className="auth-mock-text">Reviewed PRs for the analytics module.</span>
            </Box>
            <Box className="auth-mock-row is-active">
              <span className="auth-mock-time">15:30</span>
              <span className="auth-mock-text">Pair session: refactored the auth provider.</span>
              <span className="auth-mock-cursor" />
            </Box>
          </Box>
        </Box>

        {/* Right — the form column. */}
        <Box className="auth-form-col">
        {/* Logo */}
        <Box sx={{ display: "flex", justifyContent: "center", mb: 2 }}>
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: 3,
              bgcolor: BLUE,
              display: "grid",
              placeItems: "center",
              boxShadow: `0 14px 36px ${brandPurpleAlpha(0.35)}`,
            }}
          >
            <WorkOutlineIcon sx={{ color: "common.white", fontSize: 26 }} />
          </Box>
        </Box>

        {/* Title */}
        <Typography variant="h3" align="center" sx={{ fontWeight: 700, color: INK, letterSpacing: "-0.02em" }}>
          Workmark
        </Typography>
        <Typography variant="body2" align="center" sx={{ color: MUTED, mt: 0.5, mb: 3 }}>
          {mode === "signIn" ? "Sign in to your account" : "Create your account"}
        </Typography>

        {/* Card — wrapper handles hover-lift, ShineBorder paints inside the Paper */}
        <Paper
          className="auth-card-wrap"
          elevation={0}
          sx={{
            position: "relative",
            overflow: "hidden",
            p: 3,
            borderRadius: "24px",
            border: `1px solid ${HAIRLINE}`,
            bgcolor: CARD,
            boxShadow: `0 8px 32px ${AUTH.fieldBgHover}`,
            color: INK,
            transition: "box-shadow 0.25s ease, border-color 0.25s ease",
            "&:hover": {
              borderColor: HAIRLINE_STRONG,
              boxShadow: `0 24px 60px ${AUTH.fieldBorderHover}, 0 4px 16px ${AUTH.fieldBgHover}`,
            },
          }}
        >
          <ShineBorder shineColor={SHINE_COLORS} duration={14} borderWidth={1} />
          {/* Error banner (placeholder for auth errors) */}
          {error && (
            <Alert
              severity="info"
              sx={{
                mb: 2,
                position: "relative",
                zIndex: 2,
                bgcolor: brandPurpleAlpha(0.08),
                color: INK,
                border: `1px solid ${HAIRLINE}`,
                "& .MuiAlert-icon": { color: BLUE },
              }}
            >
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "grid", gap: 2, position: "relative", zIndex: 2 }}
          >
            {mode === "signUp" && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.75, color: INK, fontWeight: 500 }}>
                  Full Name
                </Typography>
                <TextField
                  fullWidth
                  placeholder="Alex Johnson"
                  value={fullName}
                  onChange={(e) => {
                    setFullName(e.target.value);
                    setError(null);
                  }}
                  autoComplete="name"
                  sx={fieldSx}
                />
              </Box>
            )}

            {/* Email */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75, color: INK, fontWeight: 500 }}>
                Email
              </Typography>
              <TextField
                fullWidth
                placeholder="you@example.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError(null);
                }}
                autoComplete="email"
                helperText={mode === "signUp" ? "Use your work email so your logs stay tied to your account." : undefined}
                sx={fieldSx}
              />
            </Box>

            {/* Password */}
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 0.75, color: INK, fontWeight: 500 }}>
                Password
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                sx={fieldSx}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword((v) => !v)}
                          edge="end"
                          sx={{ color: MUTED }}
                        >
                          {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Box>

            {mode === "signIn" && (
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: -1 }}>
                <Link
                  component="button"
                  type="button"
                  onClick={openResetDialog}
                  underline="hover"
                  sx={{ fontSize: 13, fontWeight: 500, color: BLUE }}
                >
                  Forgot password?
                </Link>
              </Box>
            )}

            {mode === "signUp" && (
              <Box>
                <Typography variant="subtitle2" sx={{ mb: 0.75, color: INK, fontWeight: 500 }}>
                  Confirm Password
                </Typography>
                <TextField
                  fullWidth
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setError(null);
                  }}
                  autoComplete="new-password"
                  sx={fieldSx}
                  slotProps={{
                    input: {
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label="toggle password visibility"
                            onClick={() => setShowPassword((v) => !v)}
                            edge="end"
                            sx={{ color: MUTED }}
                          >
                            {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
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
                bgcolor: BLUE,
                color: "common.white",
                position: "relative",
                zIndex: 2,
                "&:hover": {
                  bgcolor: BLUE_HOVER,
                  boxShadow: `0 14px 36px ${brandPurpleAlpha(0.35)}`,
                },
                "&.Mui-disabled": { bgcolor: brandPurpleAlpha(0.45), color: whiteAlpha(0.85) },
                py: 1.2,
                borderRadius: 999,
                fontWeight: 600,
                textTransform: "none",
                fontSize: 15,
              }}
            >
              {submitMethod === "password"
                ? mode === "signIn"
                  ? "Signing In..."
                  : "Creating Account..."
                : mode === "signIn"
                  ? "Sign In"
                  : "Sign Up"}
            </Button>

            <Divider sx={{ my: 0.5, color: MUTED, "&::before, &::after": { borderColor: HAIRLINE } }}>or</Divider>

            <Button
              type="button"
              variant="outlined"
              startIcon={<GoogleIcon />}
              onClick={handleGoogleAuth}
              disabled={isSubmitting}
              sx={{
                py: 1.2,
                borderRadius: 999,
                fontWeight: 500,
                textTransform: "none",
                borderColor: HAIRLINE,
                color: INK,
                bgcolor: "common.white",
                position: "relative",
                zIndex: 2,
                "&:hover": {
                  borderColor: HAIRLINE_STRONG,
                  bgcolor: AUTH.cardAlt,
                },
              }}
            >
              {submitMethod === "google"
                ? "Connecting Google..."
                : mode === "signIn"
                  ? "Continue with Google"
                  : "Sign Up with Google"}
            </Button>
            <Typography variant="caption" align="center" sx={{ color: MUTED, mt: -1 }}>
              If your account was created with Google, use this button to sign in.
            </Typography>

            <Divider sx={{ my: 0.5, "&::before, &::after": { borderColor: HAIRLINE } }} />

            {/* Footer link */}
            <Typography variant="body2" align="center" sx={{ color: MUTED }}>
              {mode === "signIn" ? "Don't have an account?" : "Already have an account?"}{" "}
              <Link
                component="button"
                type="button"
                onClick={handleToggleMode}
                underline="hover"
                sx={{ fontWeight: 600, color: BLUE }}
              >
                {mode === "signIn" ? "Sign up" : "Sign in"}
              </Link>
            </Typography>
          </Box>
        </Paper>
        </Box>
      </Box>

      <Dialog
        open={resetOpen}
        onClose={closeResetDialog}
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              borderRadius: "24px",
              minWidth: { xs: 0, sm: 440 },
              bgcolor: whiteAlpha(0.35),
              backgroundImage: `linear-gradient(135deg, ${whiteAlpha(0.55)} 0%, ${whiteAlpha(0.2)} 100%)`,
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: `1px solid ${whiteAlpha(0.55)}`,
              boxShadow: `0 16px 48px ${AUTH.glowPurple}, inset 0 1px 0 ${whiteAlpha(0.6)}`,
            },
          },
          backdrop: {
            sx: {
              backgroundColor: AUTH.glowDark,
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Reset your password</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          {resetStatus === "sent" ? (
            <DialogContentText sx={{ color: INK }}>
              If an account exists for <b>{resetEmail.trim()}</b>, a reset link is on its way.
              Check your inbox (and spam folder) to finish setting a new password.
            </DialogContentText>
          ) : (
            <>
              <DialogContentText sx={{ color: MUTED, mb: 2 }}>
                Enter the email address linked to your account and we'll send you a link to reset your password.
              </DialogContentText>
              <TextField
                autoFocus
                fullWidth
                type="email"
                placeholder="you@example.com"
                value={resetEmail}
                onChange={(e) => {
                  setResetEmail(e.target.value);
                  setResetError(null);
                }}
                error={Boolean(resetError)}
                helperText={resetError || " "}
                autoComplete="email"
                sx={fieldSx}
              />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.4 }}>
          {resetStatus === "sent" ? (
            <Button variant="contained" onClick={() => setResetOpen(false)}>
              Done
            </Button>
          ) : (
            <>
              <Button
                color="inherit"
                onClick={closeResetDialog}
                disabled={resetStatus === "sending"}
                sx={{ color: "text.secondary" }}
              >
                Cancel
              </Button>
              <Button variant="contained" onClick={handleSendReset} disabled={resetStatus === "sending"}>
                {resetStatus === "sending" ? "Sending..." : "Send reset link"}
              </Button>
            </>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
