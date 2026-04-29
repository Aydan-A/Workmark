import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Drawer,
  FormControlLabel,
  IconButton,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { computeHours } from "../entry.api";
import { ProjectAutocomplete } from "./ProjectAutocomplete";
import type { EntryFormData } from "../hooks/useLogToday";
import type { Project, WorkEntry } from "../entry.types";

type Props = {
  open: boolean;
  mode: "add" | "edit";
  initialEntry?: WorkEntry;
  defaultStartTime: string;
  defaultIsRemote: boolean;
  projects: Project[];
  onSave: (data: EntryFormData) => Promise<void>;
  onClose: () => void;
  isSaving: boolean;
  saveError: string | null;
};

function addOneHour(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const next = (h + 1) % 24;
  return `${String(next).padStart(2, "0")}:${String(m ?? 0).padStart(2, "0")}`;
}

function FieldLabel({ label, suffix }: { label: string; suffix?: string }) {
  return (
    <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 0.5 }}>
      <Typography
        variant="caption"
        sx={{
          textTransform: "uppercase",
          letterSpacing: "0.07em",
          color: "text.secondary",
          fontWeight: 600,
        }}
      >
        {label}
      </Typography>
      {suffix && (
        <Typography variant="caption" sx={{ color: "text.disabled" }}>
          {suffix}
        </Typography>
      )}
    </Box>
  );
}

export function EntryModal({
  open,
  mode,
  initialEntry,
  defaultStartTime,
  defaultIsRemote,
  projects,
  onSave,
  onClose,
  isSaving,
  saveError,
}: Props) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [startTime, setStartTime] = useState(defaultStartTime);
  const [endTime, setEndTime] = useState(addOneHour(defaultStartTime));
  const [project, setProject] = useState<EntryFormData["project"] | null>(null);
  const [note, setNote] = useState("");
  const [isRemote, setIsRemote] = useState(defaultIsRemote);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (mode === "edit" && initialEntry) {
      setStartTime(initialEntry.startTime);
      setEndTime(initialEntry.endTime);
      setProject({ id: initialEntry.projectId, name: initialEntry.projectName });
      setNote(initialEntry.note ?? "");
      setIsRemote(initialEntry.isRemote);
    } else {
      setStartTime(defaultStartTime);
      setEndTime(addOneHour(defaultStartTime));
      setProject(null);
      setNote("");
      setIsRemote(defaultIsRemote);
    }
    setTimeError(null);
    setProjectError(null);
    setShowDiscardConfirm(false);
  }, [open, mode, initialEntry, defaultStartTime, defaultIsRemote]);

  const durationLabel = useMemo(() => {
    try {
      const h = computeHours(startTime, endTime);
      return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
    } catch {
      return null;
    }
  }, [startTime, endTime]);

  const isDirty = useMemo(() => {
    if (mode !== "edit" || !initialEntry) return false;
    return (
      startTime !== initialEntry.startTime ||
      endTime !== initialEntry.endTime ||
      project?.id !== initialEntry.projectId ||
      note !== (initialEntry.note ?? "") ||
      isRemote !== initialEntry.isRemote
    );
  }, [mode, initialEntry, startTime, endTime, project, note, isRemote]);

  const handleClose = () => {
    if (isDirty) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(false);
    onClose();
  };

  const handleSubmit = async () => {
    let valid = true;
    if (!project) {
      setProjectError("Project is required.");
      valid = false;
    } else {
      setProjectError(null);
    }
    try {
      computeHours(startTime, endTime);
      setTimeError(null);
    } catch (e) {
      setTimeError(e instanceof Error ? e.message : "Invalid time range.");
      valid = false;
    }
    if (!valid) return;
    await onSave({ startTime, endTime, project: project!, note, isRemote });
  };

  const content = (
    <Box sx={{ p: { xs: 2.5, sm: 3 }, bgcolor: "rgba(255,255,255,0.92)" }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {mode === "edit" ? "Edit entry" : "New entry"}
        </Typography>
        <IconButton size="small" onClick={handleClose} aria-label="Close">
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>

      <Stack spacing={2.5}>
        <Box>
          <Box sx={{ display: "flex", gap: 2 }}>
            <Box sx={{ flex: 1 }}>
              <FieldLabel label="Start" />
              <TextField
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                slotProps={{
                  htmlInput: {
                    step: 60,
                    onClick: (e: React.MouseEvent<HTMLInputElement>) => {
                      try { e.currentTarget.showPicker(); } catch { /* unsupported */ }
                    },
                  },
                }}
                fullWidth
                error={!!timeError}
              />
            </Box>
            <Box sx={{ flex: 1 }}>
              <FieldLabel label="End" />
              <TextField
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                slotProps={{
                  htmlInput: {
                    step: 60,
                    onClick: (e: React.MouseEvent<HTMLInputElement>) => {
                      try { e.currentTarget.showPicker(); } catch { /* unsupported */ }
                    },
                  },
                }}
                fullWidth
                error={!!timeError}
              />
            </Box>
          </Box>
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 0.5, display: "block" }}>
            24-hour format (e.g., 09:00, 14:30)
          </Typography>
        </Box>

        {timeError ? (
          <Typography variant="caption" sx={{ color: "error.main", display: "block" }}>
            {timeError}
          </Typography>
        ) : durationLabel ? (
          <Box>
            <Chip label={`Duration: ${durationLabel}`} size="small" sx={{ bgcolor: "grey.100" }} />
          </Box>
        ) : null}

        <ProjectAutocomplete
          projects={projects}
          value={project}
          onChange={setProject}
          error={projectError ?? undefined}
        />

        <Box>
          <FieldLabel label="Note" suffix="optional" />
          <TextField
            placeholder="What did you work on?"
            multiline
            minRows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            fullWidth
          />
        </Box>

        <Box>
          <FormControlLabel
            control={
              <Switch
                checked={isRemote}
                onChange={(e) => setIsRemote(e.target.checked)}
              />
            }
            label="Remote"
          />
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "block", ml: "42px" }}
          >
            Worked from home or elsewhere
          </Typography>
        </Box>

        {saveError && (
          <Alert severity="error" sx={{ py: 0.5 }}>
            {saveError}
          </Alert>
        )}

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column-reverse", sm: "row" },
            gap: 1.5,
            justifyContent: { sm: "flex-end" },
            pt: 0.5,
          }}
        >
          <Button
            variant="outlined"
            onClick={onClose}
            disabled={isSaving}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSaving}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {isSaving ? "Saving…" : "Save entry"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );

  const discardDialog = (
    <Dialog
      open={showDiscardConfirm}
      onClose={() => setShowDiscardConfirm(false)}
      maxWidth="xs"
      fullWidth
    >
      <DialogTitle sx={{ fontWeight: 700 }}>Close without saving?</DialogTitle>
      <DialogContent>
        <DialogContentText>Your changes will be lost.</DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={() => setShowDiscardConfirm(false)}>
          Keep editing
        </Button>
        <Button variant="contained" color="error" onClick={handleDiscard}>
          Discard
        </Button>
      </DialogActions>
    </Dialog>
  );

  if (isMobile) {
    return (
      <>
        <Drawer
          anchor="bottom"
          open={open}
          onClose={handleClose}
          slotProps={{
            paper: {
              sx: {
                borderRadius: "20px 20px 0 0",
                maxHeight: "92vh",
                overflow: "auto",
                bgcolor: "rgba(255,255,255,0.92)",
              },
            },
          }}
        >
          {content}
        </Drawer>
        {discardDialog}
      </>
    );
  }

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="sm"
        fullWidth
        slotProps={{ paper: { sx: { bgcolor: "rgba(255,255,255,0.92)" } } }}
      >
        {content}
      </Dialog>
      {discardDialog}
    </>
  );
}
