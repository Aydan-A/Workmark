import {
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type FocusEvent as ReactFocusEvent,
  type Ref,
} from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Drawer from "@mui/material/Drawer";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { computeHours } from "../entry.api";
import { deleteReceiptFile } from "../receipt.api";
import { ProjectAutocomplete } from "./ProjectAutocomplete";
import { ReceiptUploadField } from "./ReceiptUploadField";
import { useAuth } from "../../../hooks/useAuth";
import type { EntryFormData } from "../hooks/useLogToday";
import type { Project, Receipt, WorkEntry } from "../entry.types";

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

type EntryFormHandle = {
  hasUnsavedWork: () => boolean;
  cleanup: () => void;
};

type EntryFormProps = {
  mode: "add" | "edit";
  initialEntry?: WorkEntry;
  defaultStartTime: string;
  defaultIsRemote: boolean;
  projects: Project[];
  onSave: (data: EntryFormData) => Promise<void>;
  onRequestClose: () => void;
  isSaving: boolean;
  saveError: string | null;
  handleRef: Ref<EntryFormHandle>;
};

function EntryForm({
  mode,
  initialEntry,
  defaultStartTime,
  defaultIsRemote,
  projects,
  onSave,
  onRequestClose,
  isSaving,
  saveError,
  handleRef,
}: EntryFormProps) {
  const { user } = useAuth();

  const [startTime, setStartTime] = useState(
    mode === "edit" && initialEntry ? initialEntry.startTime : defaultStartTime,
  );
  const [endTime, setEndTime] = useState(
    mode === "edit" && initialEntry ? initialEntry.endTime : addOneHour(defaultStartTime),
  );
  const [project, setProject] = useState<EntryFormData["project"] | null>(
    mode === "edit" && initialEntry
      ? { id: initialEntry.projectId, name: initialEntry.projectName }
      : null,
  );
  const [note, setNote] = useState(
    mode === "edit" && initialEntry ? (initialEntry.note ?? "") : "",
  );
  const [isRemote, setIsRemote] = useState(
    mode === "edit" && initialEntry ? initialEntry.isRemote : defaultIsRemote,
  );
  const [receipts, setReceipts] = useState<Receipt[]>(
    mode === "edit" && initialEntry ? (initialEntry.receipts ?? []) : [],
  );
  const [removedPaths, setRemovedPaths] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [projectError, setProjectError] = useState<string | null>(null);

  // Tracks storage paths uploaded in this modal session for cancel-cleanup.
  const uploadedPathsRef = useRef<Set<string>>(new Set());

  const isDirty = useMemo(() => {
    if (mode !== "edit" || !initialEntry) return false;
    const existingIds = new Set(initialEntry.receipts?.map((r) => r.id) ?? []);
    return (
      startTime !== initialEntry.startTime ||
      endTime !== initialEntry.endTime ||
      project?.id !== initialEntry.projectId ||
      note !== (initialEntry.note ?? "") ||
      isRemote !== initialEntry.isRemote ||
      receipts.length !== (initialEntry.receipts?.length ?? 0) ||
      receipts.some((r) => !existingIds.has(r.id))
    );
  }, [mode, initialEntry, startTime, endTime, project, note, isRemote, receipts]);

  useImperativeHandle(
    handleRef,
    () => ({
      hasUnsavedWork: () => isDirty || uploadedPathsRef.current.size > 0,
      cleanup: () => {
        uploadedPathsRef.current.forEach((path) => void deleteReceiptFile(path));
        uploadedPathsRef.current.clear();
      },
    }),
    [isDirty],
  );

  const handleReceiptsChange = (next: Receipt[]) => {
    next
      .filter((r) => !receipts.some((e) => e.id === r.id))
      .forEach((r) => uploadedPathsRef.current.add(r.storagePath));

    receipts
      .filter((r) => !next.some((n) => n.id === r.id))
      .forEach((r) => {
        if (uploadedPathsRef.current.has(r.storagePath)) {
          void deleteReceiptFile(r.storagePath);
          uploadedPathsRef.current.delete(r.storagePath);
        } else {
          setRemovedPaths((prev) => [...prev, r.storagePath]);
        }
      });

    setReceipts(next);
  };

  const durationLabel = useMemo(() => {
    try {
      const h = computeHours(startTime, endTime);
      return Number.isInteger(h) ? `${h}h` : `${h.toFixed(1)}h`;
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
    await onSave({
      startTime,
      endTime,
      project: project!,
      note,
      isRemote,
      receipts,
      removedReceiptPaths: removedPaths,
    });
  };

  return (
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
        <IconButton size="small" onClick={onRequestClose} aria-label="Close">
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
                    onClick: (e: ReactMouseEvent<HTMLInputElement>) => {
                      try { e.currentTarget.showPicker(); } catch { /* unsupported */ }
                    },
                    onFocus: (e: ReactFocusEvent<HTMLInputElement>) => {
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
                    onClick: (e: ReactMouseEvent<HTMLInputElement>) => {
                      try { e.currentTarget.showPicker(); } catch { /* unsupported */ }
                    },
                    onFocus: (e: ReactFocusEvent<HTMLInputElement>) => {
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

        {user && (
          <Box>
            <FieldLabel label="Documents" suffix="optional" />
            <ReceiptUploadField
              value={receipts}
              entryId={mode === "edit" && initialEntry ? initialEntry.id : null}
              uid={user.uid}
              onChange={handleReceiptsChange}
              onUploading={setIsUploading}
              disabled={isSaving}
            />
          </Box>
        )}

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
            onClick={onRequestClose}
            disabled={isSaving}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={isSaving || isUploading}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            {isSaving ? "Saving…" : isUploading ? "Uploading…" : "Save entry"}
          </Button>
        </Box>
      </Stack>
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
  const formRef = useRef<EntryFormHandle>(null);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  // Keying the form on session forces a clean remount whenever the modal
  // opens or switches between add/edit/entry — resets state and refs naturally.
  const sessionKey = `${mode}:${initialEntry?.id ?? "new"}`;

  const handleClose = () => {
    if (formRef.current?.hasUnsavedWork()) {
      setShowDiscardConfirm(true);
    } else {
      onClose();
    }
  };

  const handleDiscard = () => {
    setShowDiscardConfirm(false);
    formRef.current?.cleanup();
    onClose();
  };

  const formContent = (
    <EntryForm
      key={sessionKey}
      handleRef={formRef}
      mode={mode}
      initialEntry={initialEntry}
      defaultStartTime={defaultStartTime}
      defaultIsRemote={defaultIsRemote}
      projects={projects}
      onSave={onSave}
      onRequestClose={handleClose}
      isSaving={isSaving}
      saveError={saveError}
    />
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
          {formContent}
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
        {formContent}
      </Dialog>
      {discardDialog}
    </>
  );
}
