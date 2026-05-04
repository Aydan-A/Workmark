import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import type { WorkEntry } from "../entry.types";

type Props = {
  open: boolean;
  entry: WorkEntry | null;
  isDeleting: boolean;
  onConfirm: () => Promise<void>;
  onClose: () => void;
};

export function DeleteEntryDialog({ open, entry, isDeleting, onConfirm, onClose }: Props) {
  if (!entry) return null;

  return (
    <Dialog open={open} onClose={isDeleting ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle sx={{ fontWeight: 700 }}>Delete entry?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          <strong>{entry.startTime} – {entry.endTime}</strong> · {entry.projectName}
        </DialogContentText>
        <DialogContentText sx={{ mt: 1 }}>
          This can't be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
        <Button variant="outlined" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => void onConfirm()}
          disabled={isDeleting}
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
