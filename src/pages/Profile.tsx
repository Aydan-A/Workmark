import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import { FirebaseError } from "firebase/app";
import { deleteUser } from "firebase/auth";
import {
  BusinessCenterOutlined,
  CameraAltOutlined,
  ChevronRightRounded,
  EditOutlined,
  NotificationsOutlined,
  PersonOutlineRounded,
  VerifiedRounded,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { format, subDays } from "date-fns";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { getEntryLoadErrorMessage, subscribeToEntries } from "../features/entries/entry.api";
import type { WorkEntry } from "../features/entries/entry.types";
import { syncCurrentUserIdentity } from "../features/profile/profile.api";
import { getAccountUpdateErrorMessage, logout, updateAccountDisplayName, updateAccountEmail } from "../firebase/auth";
import { useAuth } from "../hooks/useAuth";

function getInitials(name: string) {
  const trimmed = name.trim();

  if (!trimmed) return "AJ";

  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "AJ";
}

function calculateCurrentStreak(entries: WorkEntry[], referenceDate: Date = new Date()) {
  const loggedDates = new Set(entries.map((entry) => entry.date));
  let cursor = format(referenceDate, "yyyy-MM-dd");

  if (!loggedDates.has(cursor)) {
    cursor = format(subDays(referenceDate, 1), "yyyy-MM-dd");

    if (!loggedDates.has(cursor)) {
      return 0;
    }
  }

  let streak = 0;

  while (loggedDates.has(cursor)) {
    streak += 1;
    cursor = format(subDays(new Date(`${cursor}T00:00:00`), 1), "yyyy-MM-dd");
  }

  return streak;
}

type AccountRowProps = {
  label: string;
  value: string;
  onEdit: () => void;
};

function AccountRow({ label, value, onEdit }: AccountRowProps) {
  return (
    <Box
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 2,
        px: 2,
        py: 1.6,
        borderRadius: "18px",
        border: `1px solid ${alpha(theme.palette.common.white, 0.7)}`,
        bgcolor: alpha(theme.palette.common.white, 0.32),
      })}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mb: 0.45,
            color: "text.secondary",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.16em",
          }}
        >
          {label}
        </Typography>
        <Typography variant="body1" sx={{ fontWeight: 500, color: "text.primary", wordBreak: "break-word" }}>
          {value}
        </Typography>
      </Box>

      <Button
        color="inherit"
        startIcon={<EditOutlined sx={{ fontSize: 16 }} />}
        onClick={onEdit}
        sx={{
          flexShrink: 0,
          color: "text.secondary",
          px: 1.25,
          minWidth: 0,
          bgcolor: "transparent",
          "&:hover": {
            bgcolor: "rgba(255,255,255,0.36)",
          },
        }}
      >
        Edit
      </Button>
    </Box>
  );
}

type EditableAccountField = "fullName" | "email";

type PreferenceItemProps = {
  icon: ReactNode;
  label: string;
  helperText: string;
  to: string;
};

function PreferenceItem({ icon, label, helperText, to }: PreferenceItemProps) {
  return (
    <Box
      component={RouterLink}
      to={to}
      sx={(theme) => ({
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        px: 1.75,
        py: 1.55,
        textDecoration: "none",
        color: "inherit",
        borderRadius: "18px",
        border: `1px solid ${alpha(theme.palette.common.white, 0.65)}`,
        bgcolor: alpha(theme.palette.common.white, 0.26),
        transition: "background-color 160ms ease, transform 160ms ease",
        "&:hover": {
          bgcolor: alpha(theme.palette.common.white, 0.52),
        },
      })}
    >
      <Box
        sx={(theme) => ({
          width: 42,
          height: 42,
          display: "grid",
          placeItems: "center",
          borderRadius: "14px",
          bgcolor: alpha(theme.palette.primary.main, 0.1),
          color: "primary.main",
          flexShrink: 0,
        })}
      >
        {icon}
      </Box>

      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 0.25 }}>
          {label}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {helperText}
        </Typography>
      </Box>

      <ChevronRightRounded sx={{ color: "text.secondary", flexShrink: 0 }} />
    </Box>
  );
}

export default function Profile() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [statsLoadError, setStatsLoadError] = useState<string | null>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(false);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState<string | null>(null);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [activeField, setActiveField] = useState<EditableAccountField | null>(null);
  const [fieldDraft, setFieldDraft] = useState("");
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isSavingField, setIsSavingField] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [accountOverrides, setAccountOverrides] = useState<{ fullName?: string; email?: string }>({});
  const avatarObjectUrlRef = useRef<string | null>(null);
  const profileName = accountOverrides.fullName?.trim() || user?.displayName?.trim() || "Alex Johnson";
  const profileEmail = accountOverrides.email?.trim() || user?.email?.trim() || "alex.johnson@example.com";

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setStatsLoadError(null);
      setIsStatsLoading(false);
      setAccountOverrides({});
      return;
    }

    setIsStatsLoading(true);

    const unsubscribe = subscribeToEntries(
      (nextEntries) => {
        setEntries(nextEntries);
        setStatsLoadError(null);
        setIsStatsLoading(false);
      },
      (error) => {
        setStatsLoadError(getEntryLoadErrorMessage(error));
        setIsStatsLoading(false);
      },
      { orderDirection: "asc" },
    );

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    return () => {
      if (avatarObjectUrlRef.current) {
        URL.revokeObjectURL(avatarObjectUrlRef.current);
      }
    };
  }, []);

  const memberSince = useMemo(() => {
    const creationTime = user?.metadata.creationTime;

    if (!creationTime) return "Recently";

    return format(new Date(creationTime), "MMM yyyy");
  }, [user?.metadata.creationTime]);

  const logsThisMonth = useMemo(() => {
    const monthPrefix = format(new Date(), "yyyy-MM");
    return new Set(
      entries
        .filter((entry) => entry.date.startsWith(monthPrefix))
        .map((entry) => entry.date),
    ).size;
  }, [entries]);

  const currentStreak = useMemo(() => calculateCurrentStreak(entries), [entries]);

  const fieldDefinitions: Record<
    EditableAccountField,
    {
      dialogTitle: string;
      helperText: string;
      placeholder: string;
      inputType?: string;
      value: string;
      displayValue: string;
    }
  > = {
    fullName: {
      dialogTitle: "Edit full name",
      helperText: "This updates the name shown across your account.",
      placeholder: "Enter your full name",
      value: accountOverrides.fullName?.trim() || user?.displayName?.trim() || "",
      displayValue: profileName,
    },
    email: {
      dialogTitle: "Edit email",
      helperText: "Changing your email may require a recent sign-in.",
      placeholder: "name@example.com",
      inputType: "email",
      value: accountOverrides.email?.trim() || user?.email?.trim() || "",
      displayValue: profileEmail,
    },
  };

  const stats = [
    { label: "Member since", value: memberSince },
    { label: "Logs this month", value: isStatsLoading ? "..." : String(logsThisMonth) },
    { label: "Current streak", value: isStatsLoading ? "..." : `${currentStreak} day${currentStreak === 1 ? "" : "s"}` },
  ];

  const accountRows = [
    { key: "fullName" as const, label: "Full name", value: fieldDefinitions.fullName.displayValue },
    { key: "email" as const, label: "Email", value: fieldDefinitions.email.displayValue },
  ];

  const preferenceItems = [
    {
      label: "Profile",
      helperText: "Name, avatar, and email.",
      icon: <PersonOutlineRounded fontSize="small" />,
      to: "/preferences/profile",
    },
    {
      label: "Team",
      helperText: "Manager and remote hour approvals.",
      icon: <BusinessCenterOutlined fontSize="small" />,
      to: "/preferences/team",
    },
    {
      label: "Notifications",
      helperText: "Basic notification toggles.",
      icon: <NotificationsOutlined fontSize="small" />,
      to: "/preferences/notifications",
    },
  ];

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextFile = event.target.files?.[0];

    if (!nextFile) return;

    if (avatarObjectUrlRef.current) {
      URL.revokeObjectURL(avatarObjectUrlRef.current);
    }

    const nextObjectUrl = URL.createObjectURL(nextFile);
    avatarObjectUrlRef.current = nextObjectUrl;
    setAvatarPreviewUrl(nextObjectUrl);
    event.target.value = "";
  };

  const openFieldEditor = (field: EditableAccountField) => {
    setActiveField(field);
    setFieldDraft(fieldDefinitions[field].value);
    setFieldError(null);
  };

  const closeFieldEditor = () => {
    if (isSavingField) return;
    setActiveField(null);
    setFieldDraft("");
    setFieldError(null);
  };

  const handleSaveField = async () => {
    if (!activeField || !user || isSavingField) return;

    const nextValue = fieldDraft.trim();

    if ((activeField === "fullName" || activeField === "email") && !nextValue) {
      setFieldError("This field cannot be empty.");
      return;
    }

    setIsSavingField(true);
    setFieldError(null);

    try {
      if (activeField === "fullName") {
        await updateAccountDisplayName(nextValue);
        await syncCurrentUserIdentity(user);
        setAccountOverrides((current) => ({ ...current, fullName: nextValue }));
      } else {
        await updateAccountEmail(nextValue);
        await syncCurrentUserIdentity(user);
        setAccountOverrides((current) => ({ ...current, email: nextValue }));
      }

      setActiveField(null);
      setFieldDraft("");
      setFieldError(null);
    } catch (error) {
      setFieldError(getAccountUpdateErrorMessage(error));
    } finally {
      setIsSavingField(false);
    }
  };

  const handleSignOutAllDevices = async () => {
    if (isSignOutLoading) return;

    setIsSignOutLoading(true);

    try {
      await logout();
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("Failed to sign out:", error);
    } finally {
      setIsSignOutLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user || isDeletingAccount) return;

    setIsDeletingAccount(true);
    setDeleteError(null);

    try {
      await deleteUser(user);
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof FirebaseError && error.code === "auth/requires-recent-login") {
        setDeleteError("For security, sign in again before deleting your account.");
      } else {
        setDeleteError("Could not delete your account. Please try again.");
      }
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <Box>
      <Paper
        variant="outlined"
        sx={{
          p: { xs: 2.5, md: 3.5 },
          borderRadius: "24px",
          borderColor: "rgba(255,255,255,0.8)",
        }}
      >
        <Stack
          direction={{ xs: "column", lg: "row" }}
          spacing={{ xs: 2.5, lg: 3 }}
          alignItems={{ xs: "flex-start", lg: "center" }}
          justifyContent="space-between"
        >
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2.5}
            alignItems={{ xs: "flex-start", sm: "center" }}
            sx={{ minWidth: 0 }}
          >
            <Box
              component="label"
              sx={{
                position: "relative",
                display: "inline-flex",
                borderRadius: "28px",
                cursor: "pointer",
                "&:hover .avatar-overlay, &:focus-within .avatar-overlay": {
                  opacity: 1,
                },
              }}
            >
              <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />

              <Avatar
                src={avatarPreviewUrl || user?.photoURL || undefined}
                sx={{
                  width: 84,
                  height: 84,
                  bgcolor: "primary.main",
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  boxShadow: "0 18px 32px rgba(112, 87, 246, 0.22)",
                }}
              >
                {getInitials(profileName)}
              </Avatar>

              <Box
                className="avatar-overlay"
                sx={{
                  position: "absolute",
                  inset: 0,
                  display: "grid",
                  placeItems: "center",
                  borderRadius: "28px",
                  bgcolor: "rgba(31,35,64,0.52)",
                  color: "#fff",
                  opacity: 0,
                  transition: "opacity 160ms ease",
                }}
              >
                <CameraAltOutlined />
              </Box>
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography variant="h2" sx={{ mb: 0.8 }}>
                {profileName}
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" useFlexGap flexWrap="wrap">
                <Typography variant="body1" sx={{ color: "text.secondary" }}>
                  {profileEmail}
                </Typography>
                <Chip
                  icon={<VerifiedRounded sx={{ fontSize: 16 }} />}
                  label="Verified"
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    color: theme.palette.success.dark,
                    border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
                    "& .MuiChip-icon": {
                      color: theme.palette.success.main,
                    },
                  }}
                />
              </Stack>

              <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.85, maxWidth: 520 }}>
                Account details, profile settings, and personal preferences for your workspace.
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ width: "100%", maxWidth: { xs: "100%", lg: 420 } }}>
            <Button
              variant="contained"
              startIcon={<EditOutlined />}
              onClick={() => openFieldEditor("fullName")}
              sx={{
                alignSelf: "flex-end",
                ml: { xs: 0, lg: "auto" },
                display: "flex",
                mb: 1.35,
              }}
            >
              Edit profile
            </Button>

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                borderRadius: "20px",
                overflow: "hidden",
                border: `1px solid ${alpha(theme.palette.common.white, 0.85)}`,
                bgcolor: alpha(theme.palette.common.white, 0.4),
              }}
            >
              {stats.map((stat, index) => (
                <Box
                  key={stat.label}
                  sx={{
                    px: { xs: 1.35, sm: 1.6 },
                    py: 1.45,
                    borderLeft: index === 0 ? "none" : `1px solid ${alpha(theme.palette.divider, 0.9)}`,
                  }}
                >
                  <Typography variant="caption" sx={{ display: "block", color: "text.secondary", mb: 0.35 }}>
                    {stat.label}
                  </Typography>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
                    {stat.value}
                  </Typography>
                </Box>
              ))}
            </Box>

            {statsLoadError ? (
              <Typography variant="caption" sx={{ display: "block", mt: 0.95, color: "error.main" }}>
                {statsLoadError}
              </Typography>
            ) : null}
          </Box>
        </Stack>
      </Paper>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(2, minmax(0, 1fr))" },
          gap: 2,
          mt: 2.5,
        }}
      >
        <Paper variant="outlined" sx={{ p: 2.75, borderRadius: "24px", borderColor: "rgba(255,255,255,0.8)" }}>
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mb: 1.75 }}>
            Account information
          </Typography>
          <Stack spacing={1.15}>
            {accountRows.map((row) => (
              <AccountRow
                key={row.label}
                label={row.label}
                value={row.value}
                onEdit={() => openFieldEditor(row.key)}
              />
            ))}
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            p: 2.75,
            borderRadius: "24px",
            borderColor: "rgba(255,255,255,0.8)",
          }}
        >
          <Typography variant="subtitle1" sx={{ color: "text.secondary", mb: 1.75 }}>
            Preferences
          </Typography>
          <Stack spacing={1.15}>
            {preferenceItems.map((item) => (
              <PreferenceItem
                key={item.label}
                icon={item.icon}
                label={item.label}
                helperText={item.helperText}
                to={item.to}
              />
            ))}
          </Stack>
        </Paper>

        <Paper
          variant="outlined"
          sx={{
            gridColumn: "1 / -1",
            p: { xs: 2.2, md: 2.5 },
            borderRadius: "24px",
            borderColor: alpha(theme.palette.divider, 0.55),
            bgcolor: alpha(theme.palette.common.white, 0.28),
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", md: "center" }}
            justifyContent="space-between"
          >
            <Box>
              <Typography variant="subtitle1" sx={{ color: "text.primary", fontWeight: 700, mb: 0.35 }}>
                Account actions
              </Typography>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Manage active access and permanently remove this account when needed.
              </Typography>
            </Box>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.15} sx={{ width: { xs: "100%", md: "auto" } }}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleSignOutAllDevices}
                disabled={isSignOutLoading}
                sx={{
                  borderColor: alpha(theme.palette.text.primary, 0.12),
                  color: "text.primary",
                  bgcolor: alpha(theme.palette.common.white, 0.36),
                }}
              >
                Sign out of all devices
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => {
                  setDeleteError(null);
                  setIsDeleteDialogOpen(true);
                }}
              >
                Delete account
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>

      <Dialog
        open={Boolean(activeField)}
        onClose={closeFieldEditor}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            border: `1px solid ${alpha(theme.palette.common.white, 0.9)}`,
            minWidth: { xs: 0, sm: 440 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          {activeField ? fieldDefinitions[activeField].dialogTitle : "Edit field"}
        </DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <DialogContentText sx={{ color: "text.secondary", mb: 2 }}>
            {activeField ? fieldDefinitions[activeField].helperText : ""}
          </DialogContentText>
          <TextField
            autoFocus
            fullWidth
            type={activeField ? fieldDefinitions[activeField].inputType ?? "text" : "text"}
            value={fieldDraft}
            onChange={(event) => setFieldDraft(event.target.value)}
            placeholder={activeField ? fieldDefinitions[activeField].placeholder : ""}
            error={Boolean(fieldError)}
            helperText={fieldError || " "}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.4 }}>
          <Button color="inherit" onClick={closeFieldEditor} disabled={isSavingField} sx={{ color: "text.secondary" }}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSaveField} disabled={isSavingField}>
            {isSavingField ? "Saving..." : "Save changes"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={isDeleteDialogOpen}
        onClose={() => {
          if (isDeletingAccount) return;
          setIsDeleteDialogOpen(false);
        }}
        PaperProps={{
          sx: {
            borderRadius: "24px",
            border: `1px solid ${alpha(theme.palette.common.white, 0.9)}`,
            minWidth: { xs: 0, sm: 420 },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>Delete account?</DialogTitle>
        <DialogContent sx={{ pt: "8px !important" }}>
          <DialogContentText sx={{ color: "text.secondary" }}>
            This permanently removes your account. You may be asked to sign in again before the deletion can complete.
          </DialogContentText>
          {deleteError ? (
            <Typography variant="body2" sx={{ mt: 1.5, color: "error.main" }}>
              {deleteError}
            </Typography>
          ) : null}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.4 }}>
          <Button
            color="inherit"
            onClick={() => setIsDeleteDialogOpen(false)}
            disabled={isDeletingAccount}
            sx={{ color: "text.secondary" }}
          >
            Cancel
          </Button>
          <Button color="error" variant="contained" onClick={handleDeleteAccount} disabled={isDeletingAccount}>
            {isDeletingAccount ? "Deleting..." : "Delete account"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
