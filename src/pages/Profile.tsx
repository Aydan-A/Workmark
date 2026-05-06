import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { FirebaseError } from "firebase/app";
import { deleteUser } from "firebase/auth";
import {
  BusinessCenterOutlined,
  CameraAltOutlined,
  EditOutlined,
  ExpandMoreRounded,
  PersonOutlineRounded,
  VerifiedRounded,
} from "@mui/icons-material";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
import { useNavigate } from "react-router-dom";
import { getEntryLoadErrorMessage, subscribeToEntries } from "../features/entries/entry.api";
import type { WorkEntry } from "../features/entries/entry.types";
import {
  purgeUserData,
  saveManagerEmail,
  sendManagerNotificationEmail,
  subscribeToManagedUsers,
  subscribeToUserProfile,
  syncCurrentUserIdentity,
  type ManagedUser,
} from "../features/profile/profile.api";
import { getAccountUpdateErrorMessage, logout, updateAccountDisplayName, updateAccountEmail } from "../firebase/auth";
import { useAuth } from "../hooks/useAuth";
import { getInitials } from "../utils/formatters";

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
  const [profileDisplayNameDraft, setProfileDisplayNameDraft] = useState(
    () => user?.displayName?.trim() ?? "",
  );
  const [profileEmailDraft, setProfileEmailDraft] = useState(
    () => user?.email?.trim() ?? "",
  );
  const [isSavingProfileForm, setIsSavingProfileForm] = useState(false);
  const [profileFormError, setProfileFormError] = useState<string | null>(null);
  const [managerEmailDraft, setManagerEmailDraft] = useState("");
  const [savedManagerEmail, setSavedManagerEmail] = useState("");
  const [isSavingManagerEmail, setIsSavingManagerEmail] = useState(false);
  const [isRemovingManagerEmail, setIsRemovingManagerEmail] = useState(false);
  const [managerEmailError, setManagerEmailError] = useState<string | null>(null);
  const [managerEmailSaved, setManagerEmailSaved] = useState(false);
  const [reportingUsers, setReportingUsers] = useState<ManagedUser[]>([]);
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

  useEffect(() => {
    const email = user?.email?.trim();
    if (!email) {
      setReportingUsers([]);
      return;
    }

    return subscribeToManagedUsers(
      email,
      (users) => setReportingUsers(users),
      (error) => console.error("Failed to load reporting users:", error),
    );
  }, [user?.email]);

  useEffect(() => {
    if (!user) {
      setSavedManagerEmail("");
      return;
    }

    return subscribeToUserProfile(
      (profile) => {
        setSavedManagerEmail(profile?.managerEmail ?? "");
      },
      (error) => {
        console.error("Failed to load user profile:", error);
        const detail = error instanceof Error ? error.message : String(error);
        setManagerEmailError(`Failed to load manager email: ${detail}`);
      },
    );
  }, [user]);

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

  const handleSaveProfileForm = async () => {
    if (!user || isSavingProfileForm) return;

    const newName = profileDisplayNameDraft.trim();
    const newEmail = profileEmailDraft.trim();

    if (!newName) {
      setProfileFormError("Display name cannot be empty.");
      return;
    }
    if (!newEmail) {
      setProfileFormError("Email cannot be empty.");
      return;
    }

    setIsSavingProfileForm(true);
    setProfileFormError(null);

    try {
      const nameChanged = newName !== (user.displayName?.trim() ?? "");
      const emailChanged = newEmail !== (user.email?.trim() ?? "");

      if (nameChanged) {
        await updateAccountDisplayName(newName);
        setAccountOverrides((current) => ({ ...current, fullName: newName }));
      }
      if (emailChanged) {
        await updateAccountEmail(newEmail);
        setAccountOverrides((current) => ({ ...current, email: newEmail }));
      }
      if (nameChanged || emailChanged) {
        await syncCurrentUserIdentity(user);
      }
    } catch (error) {
      setProfileFormError(getAccountUpdateErrorMessage(error));
    } finally {
      setIsSavingProfileForm(false);
    }
  };

  const handleSaveManagerEmail = async () => {
    if (isSavingManagerEmail) return;

    const trimmed = managerEmailDraft.trim();

    setIsSavingManagerEmail(true);
    setManagerEmailError(null);
    setManagerEmailSaved(false);

    try {
      await saveManagerEmail(trimmed);
      setManagerEmailDraft("");
      setManagerEmailSaved(true);
    } catch (error) {
      console.error("Failed to save manager email:", error);
      const detail = error instanceof Error ? error.message : "";
      setManagerEmailError(
        detail ? `Failed to save manager email: ${detail}` : "Failed to save manager email. Please try again.",
      );
    } finally {
      setIsSavingManagerEmail(false);
    }
  };

  const handleRemoveManagerEmail = async () => {
    if (isRemovingManagerEmail) return;

    setIsRemovingManagerEmail(true);
    setManagerEmailError(null);
    setManagerEmailSaved(false);

    try {
      await saveManagerEmail("");
    } catch (error) {
      console.error("Failed to remove manager email:", error);
      const detail = error instanceof Error ? error.message : "";
      setManagerEmailError(
        detail ? `Failed to remove manager: ${detail}` : "Failed to remove manager. Please try again.",
      );
    } finally {
      setIsRemovingManagerEmail(false);
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
      await purgeUserData(user.uid);
      await deleteUser(user);
      navigate("/login", { replace: true });
    } catch (error) {
      if (error instanceof FirebaseError && error.code === "auth/requires-recent-login") {
        setDeleteError("For security, sign in again before deleting your account.");
      } else if (error instanceof Error) {
        setDeleteError(`Could not delete your account: ${error.message}`);
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
              <Typography
                variant="h2"
                sx={{
                  mb: 0.4,
                  fontWeight: 800,
                  color: "text.primary",
                  fontSize: { xs: "1.85rem", sm: "2.25rem" },
                  letterSpacing: "-0.02em",
                  lineHeight: 1.15,
                }}
              >
                {profileName}
              </Typography>

              <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.75, fontWeight: 500 }}>
                Member since {memberSince} · Personal workspace
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
            </Box>
          </Stack>

          <Box sx={{ width: "100%", maxWidth: { xs: "100%", lg: 420 } }}>

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
          <Stack spacing={1.5}>
            {/* Profile accordion */}
            <Accordion
              disableGutters
              elevation={0}
              sx={(theme) => ({
                borderRadius: "18px !important",
                border: `1px solid ${alpha(theme.palette.common.white, 0.65)}`,
                bgcolor: alpha(theme.palette.common.white, 0.26),
                "&:before": { display: "none" },
              })}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRounded sx={{ color: "text.secondary" }} />}
                sx={{
                  px: 1.75,
                  minHeight: 0,
                  "& .MuiAccordionSummary-content": { my: 1.75 },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
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
                    <PersonOutlineRounded fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 0.25 }}>
                      Profile
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Name, avatar, and email.
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1.75, pb: 2, pt: 0 }}>
                <Stack direction="row" alignItems="center" spacing={2} sx={{ mb: 2 }}>
                  <Box
                    component="label"
                    sx={{
                      position: "relative",
                      display: "inline-flex",
                      borderRadius: "16px",
                      cursor: "pointer",
                      "&:hover .pref-avatar-overlay, &:focus-within .pref-avatar-overlay": {
                        opacity: 1,
                      },
                    }}
                  >
                    <input hidden accept="image/*" type="file" onChange={handleAvatarChange} />
                    <Avatar
                      src={avatarPreviewUrl || user?.photoURL || undefined}
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: "primary.main",
                        fontSize: "1rem",
                        fontWeight: 700,
                      }}
                    >
                      {getInitials(profileName)}
                    </Avatar>
                    <Box
                      className="pref-avatar-overlay"
                      sx={{
                        position: "absolute",
                        inset: 0,
                        display: "grid",
                        placeItems: "center",
                        borderRadius: "16px",
                        bgcolor: "rgba(31,35,64,0.52)",
                        color: "#fff",
                        opacity: 0,
                        transition: "opacity 160ms ease",
                      }}
                    >
                      <CameraAltOutlined sx={{ fontSize: 18 }} />
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Click to upload a profile photo
                  </Typography>
                </Stack>

                <Stack spacing={1.25}>
                  <TextField
                    label="Name"
                    fullWidth
                    size="small"
                    value={profileDisplayNameDraft}
                    onChange={(event) => setProfileDisplayNameDraft(event.target.value)}
                  />
                  <TextField
                    label="Email"
                    fullWidth
                    size="small"
                    type="email"
                    value={profileEmailDraft}
                    onChange={(event) => setProfileEmailDraft(event.target.value)}
                  />
                  {profileFormError ? (
                    <Typography variant="caption" sx={{ color: "error.main" }}>
                      {profileFormError}
                    </Typography>
                  ) : null}
                  <Button
                    variant="contained"
                    onClick={handleSaveProfileForm}
                    disabled={isSavingProfileForm}
                    sx={{ alignSelf: "flex-end" }}
                  >
                    {isSavingProfileForm ? "Saving..." : "Save profile"}
                  </Button>
                </Stack>
              </AccordionDetails>
            </Accordion>

            {/* Team accordion */}
            <Accordion
              disableGutters
              elevation={0}
              sx={(theme) => ({
                borderRadius: "18px !important",
                border: `1px solid ${alpha(theme.palette.common.white, 0.65)}`,
                bgcolor: alpha(theme.palette.common.white, 0.26),
                "&:before": { display: "none" },
              })}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreRounded sx={{ color: "text.secondary" }} />}
                sx={{
                  px: 1.75,
                  minHeight: 0,
                  "& .MuiAccordionSummary-content": { my: 1.75 },
                }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
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
                    <BusinessCenterOutlined fontSize="small" />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "text.primary", mb: 0.25 }}>
                      Team
                    </Typography>
                    <Typography variant="body2" sx={{ color: "text.secondary" }}>
                      Manager
                    </Typography>
                  </Box>
                </Stack>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 1.75, pb: 2, pt: 0 }}>
                <Stack spacing={1.25}>
                  <TextField
                    label="Manager email"
                    fullWidth
                    size="small"
                    type="email"
                    value={managerEmailDraft}
                    onChange={(event) => {
                      setManagerEmailDraft(event.target.value);
                      setManagerEmailSaved(false);
                    }}
                    placeholder={savedManagerEmail ? "Replace with another email" : "manager@company.com"}
                  />
                  {managerEmailError ? (
                    <Typography variant="caption" sx={{ color: "error.main" }}>
                      {managerEmailError}
                    </Typography>
                  ) : managerEmailSaved ? (
                    <Typography variant="caption" sx={{ color: "success.main" }}>
                      Manager saved.
                    </Typography>
                  ) : null}
                  <Button
                    variant="contained"
                    onClick={handleSaveManagerEmail}
                    disabled={isSavingManagerEmail || !managerEmailDraft.trim()}
                    sx={{ alignSelf: "flex-end" }}
                  >
                    {isSavingManagerEmail ? "Saving..." : savedManagerEmail ? "Update" : "Save"}
                  </Button>

                  {savedManagerEmail ? (
                    <Box
                      sx={(theme) => ({
                        mt: 0.5,
                        p: 1.25,
                        borderRadius: "12px",
                        border: `1px solid ${alpha(theme.palette.common.white, 0.7)}`,
                        bgcolor: alpha(theme.palette.common.white, 0.32),
                      })}
                    >
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={1}
                      >
                        <Box sx={{ minWidth: 0 }}>
                          <Typography
                            variant="caption"
                            sx={{
                              display: "block",
                              color: "text.secondary",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.16em",
                              mb: 0.25,
                            }}
                          >
                            Your manager
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: "text.primary", fontWeight: 500, wordBreak: "break-word" }}
                          >
                            {savedManagerEmail}
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
                          <Button
                            size="small"
                            color="inherit"
                            onClick={() =>
                              sendManagerNotificationEmail(savedManagerEmail, profileName)
                            }
                            sx={{ color: "text.primary" }}
                          >
                            Notify
                          </Button>
                          <Button
                            size="small"
                            color="inherit"
                            onClick={handleRemoveManagerEmail}
                            disabled={isRemovingManagerEmail}
                            sx={{ color: "text.secondary" }}
                          >
                            {isRemovingManagerEmail ? "Removing..." : "Remove"}
                          </Button>
                        </Stack>
                      </Stack>
                    </Box>
                  ) : null}

                  <Box sx={{ mt: 1 }}>
                    <Typography
                      variant="caption"
                      sx={{
                        display: "block",
                        mb: 0.75,
                        color: "text.secondary",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.16em",
                      }}
                    >
                      People reporting to you
                    </Typography>
                    {reportingUsers.length === 0 ? (
                      <Typography variant="body2" sx={{ color: "text.secondary" }}>
                        No one has added you as their manager yet.
                      </Typography>
                    ) : (
                      <Stack spacing={0.5}>
                        {reportingUsers.map((reporter) => (
                          <Typography
                            key={reporter.uid}
                            variant="body2"
                            sx={{ color: "text.primary", fontWeight: 500 }}
                          >
                            {reporter.fullName}
                          </Typography>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </Stack>
              </AccordionDetails>
            </Accordion>
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
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              borderRadius: "24px",
              minWidth: { xs: 0, sm: 440 },
              bgcolor: "rgba(255, 255, 255, 0.35)",
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 100%)",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.55)",
              boxShadow:
                "0 16px 48px rgba(80, 70, 180, 0.22), inset 0 1px 0 rgba(255,255,255,0.6)",
            },
          },
          backdrop: {
            sx: {
              backgroundColor: "rgba(20, 22, 50, 0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            },
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
        slotProps={{
          paper: {
            elevation: 0,
            sx: {
              borderRadius: "24px",
              minWidth: { xs: 0, sm: 420 },
              bgcolor: "rgba(255, 255, 255, 0.35)",
              backgroundImage:
                "linear-gradient(135deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.2) 100%)",
              backdropFilter: "blur(28px) saturate(200%)",
              WebkitBackdropFilter: "blur(28px) saturate(200%)",
              border: "1px solid rgba(255, 255, 255, 0.55)",
              boxShadow:
                "0 16px 48px rgba(80, 70, 180, 0.22), inset 0 1px 0 rgba(255,255,255,0.6)",
            },
          },
          backdrop: {
            sx: {
              backgroundColor: "rgba(20, 22, 50, 0.18)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            },
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
