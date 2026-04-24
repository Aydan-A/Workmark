import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  Drawer,
  FormControlLabel,
  Stack,
  Switch,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { computeHours } from "../entry.api";
import { formatHours } from "../entry.utils";
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
  }, [open, mode, initialEntry, defaultStartTime, defaultIsRemote]);

  const durationLabel = useMemo(() => {
    try {
      return formatHours(computeHours(startTime, endTime));
    } catch {
      return null;
    }
  }, [startTime, endTime]);

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
    <Box sx={{ p: { xs: 2.5, sm: 3 } }}>
      <Typography variant="h6" sx={{ mb: 2.5, fontWeight: 700 }}>
        {mode === "edit" ? "Edit entry" : "Add entry"}
      </Typography>
      <Stack spacing={2.5}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
          <TextField
            label="Start"
            type="time"
            value={startTime}
            onChange={(e) => setStartTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
            error={!!timeError}
          />
          <TextField
            label="End"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
            slotProps={{ inputLabel: { shrink: true } }}
            sx={{ flex: 1 }}
            error={!!timeError}
          />
          {durationLabel && (
            <Box sx={{ pt: 1.75, flexShrink: 0 }}>
              <Typography variant="body2" sx={{ color: "text.secondary", fontWeight: 600 }}>
                {durationLabel}
              </Typography>
            </Box>
          )}
        </Box>

        {timeError && (
          <Typography variant="caption" sx={{ color: "error.main", display: "block" }}>
            {timeError}
          </Typography>
        )}

        <ProjectAutocomplete
          projects={projects}
          value={project}
          onChange={setProject}
          error={projectError ?? undefined}
        />

        <TextField
          label="Note"
          placeholder="What did you work on?"
          multiline
          minRows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          slotProps={{ inputLabel: { shrink: true } }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
            />
          }
          label="Remote"
        />

        {saveError && (
          <Alert severity="error" sx={{ py: 0.5 }}>
            {saveError}
          </Alert>
        )}

        <Box sx={{ display: "flex", gap: 1.5, justifyContent: "flex-end", pt: 0.5 }}>
          <Button variant="text" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? "Saving…" : "Save"}
          </Button>
        </Box>
      </Stack>
    </Box>
  );

  if (isMobile) {
    return (
      <Drawer
        anchor="bottom"
        open={open}
        onClose={onClose}
        slotProps={{
          paper: { sx: { borderRadius: "20px 20px 0 0", maxHeight: "92vh", overflow: "auto" } },
        }}
      >
        {content}
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      {content}
    </Dialog>
  );
}
