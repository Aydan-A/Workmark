import { useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { format } from "date-fns";

export default function LogToday() {
  const today = new Date();
  const [entryDate, setEntryDate] = useState(format(today, "yyyy-MM-dd"));
  const [totalHours, setTotalHours] = useState("");
  const [remoteHours, setRemoteHours] = useState("");
  const [project, setProject] = useState("none");
  const [description, setDescription] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const canSave = useMemo(() => {
    if (totalHours.trim() === "") return false;
    const parsed = Number(totalHours);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 24;
  }, [totalHours]);

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const selected = Array.from(fileList);
    if (selected.length > 3) {
      setFileError("You can upload up to 3 receipts.");
      return;
    }

    const invalid = selected.find((file) => file.size > 5 * 1024 * 1024);
    if (invalid) {
      setFileError(`"${invalid.name}" is larger than 5MB.`);
      return;
    }

    setFileError(null);
    setReceipts(selected);
  };

  const handleSave = async () => {
    if (!canSave || isSaving) return;
    setIsSaving(true);

    // Placeholder save flow for UI phase.
    await new Promise((resolve) => setTimeout(resolve, 550));
    setIsSaving(false);
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h2">Log Today</Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
            {format(today, "EEEE, MMMM d, yyyy")}
          </Typography>
        </Box>

        <Box sx={{ borderTop: "1px solid #e5e7eb", p: 3 }}>
          <Stack spacing={2.5}>
            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Date <Typography component="span" variant="caption">Today</Typography>
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={entryDate}
                onChange={(event) => setEntryDate(event.target.value)}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Total Hours <Typography component="span" variant="caption" sx={{ color: "#dc2626" }}>*</Typography>
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="e.g. 8"
                  value={totalHours}
                  onChange={(event) => setTotalHours(event.target.value)}
                  sx={{ mt: 1 }}
                />
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {["6", "8", "10"].map((hours) => (
                    <Chip
                      key={hours}
                      label={`${hours}h`}
                      clickable
                      variant={totalHours === hours ? "filled" : "outlined"}
                      color={totalHours === hours ? "primary" : "default"}
                      onClick={() => setTotalHours(hours)}
                    />
                  ))}
                </Stack>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Remote Hours <Typography component="span" variant="caption">optional</Typography>
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="e.g. 4"
                  value={remoteHours}
                  onChange={(event) => setRemoteHours(event.target.value)}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Project <Typography component="span" variant="caption">optional</Typography>
              </Typography>
              <TextField
                fullWidth
                select
                value={project}
                onChange={(event) => setProject(event.target.value)}
                sx={{ mt: 1 }}
              >
                <MenuItem value="none">None</MenuItem>
                <MenuItem value="worklog-web">Worklog Web</MenuItem>
                <MenuItem value="client-portal">Client Portal</MenuItem>
                <MenuItem value="internal-tools">Internal Tools</MenuItem>
              </TextField>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Work Description <Typography component="span" variant="caption">optional</Typography>
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={4}
                placeholder="What did you work on today?"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Expenses / Proof <Typography component="span" variant="caption">optional - up to 3 receipts</Typography>
              </Typography>

              <Box
                sx={{
                  mt: 1,
                  border: "1px dashed #cbd5e1",
                  borderRadius: 3,
                  p: 2.5,
                  textAlign: "center",
                  bgcolor: "#f8fafc",
                }}
              >
                <Button
                  component="label"
                  variant="text"
                  startIcon={<UploadFileIcon />}
                  sx={{ fontWeight: 700 }}
                >
                  Click to upload receipts
                  <input hidden type="file" accept="image/jpeg,image/png" multiple onChange={handleReceiptUpload} />
                </Button>
                <Typography variant="caption" sx={{ display: "block", mt: 0.75 }}>
                  Accepted: JPG/PNG, max 5MB each
                </Typography>

                {receipts.length > 0 && (
                  <Stack direction="row" spacing={1} justifyContent="center" sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 1 }}>
                    {receipts.map((file) => (
                      <Chip key={file.name} label={file.name} />
                    ))}
                  </Stack>
                )}
              </Box>

              {fileError && (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  {fileError}
                </Alert>
              )}
            </Box>
          </Stack>
        </Box>

        <Box sx={{ borderTop: "1px solid #e5e7eb", p: 2.5, display: "flex", justifyContent: "flex-end", bgcolor: "#f8fafc" }}>
          <Button
            variant="contained"
            disabled={!canSave || isSaving}
            onClick={handleSave}
            sx={{ minWidth: 132, py: 1.1, fontWeight: 700 }}
          >
            {isSaving ? "Saving..." : "Save Entry"}
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
