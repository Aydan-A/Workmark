import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getEntryErrorMessage, saveWorkEntry } from "../features/entries/entry.api";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const DEFAULT_PROJECT_OPTIONS = [
  "Customer Service",
  "Repair and Diagnostics",
  "Installation/Setup",
  "Warranty and Returns",
  "Sales Support",
  "Supplier/Brand Communication",
  "Parts and Inventory",
  "Product Testing/Quality Assurance",
  "Training and Documentation",
  "Website/Shopify/E-commerce",
  "Marketing/Content",
  "Internal Operations",
];

export default function LogToday() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const todayLabel = format(today, "EEEE, MMMM d, yyyy");

  const queryDate = searchParams.get("date");
  const initialDate = queryDate && DATE_KEY_PATTERN.test(queryDate) ? queryDate : todayKey;

  const [entryDate, setEntryDate] = useState(initialDate);
  const [totalHours, setTotalHours] = useState("");
  const [remoteHours, setRemoteHours] = useState("");
  const [availableProjects, setAvailableProjects] = useState<string[]>(DEFAULT_PROJECT_OPTIONS);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [customProjectName, setCustomProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const slowSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSave = useMemo(() => {
    if (totalHours.trim() === "") return false;
    const parsed = Number(totalHours);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 24;
  }, [totalHours]);

  const selectedDateLabel = useMemo(() => {
    if (!DATE_KEY_PATTERN.test(entryDate)) return todayLabel;
    const parsed = new Date(`${entryDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return todayLabel;
    return format(parsed, "EEEE, MMMM d, yyyy");
  }, [entryDate, todayLabel]);

  const headerTitle = entryDate === todayKey ? "Log Today" : "Log Entry";

  useEffect(() => {
    if (queryDate && DATE_KEY_PATTERN.test(queryDate)) {
      setEntryDate(queryDate);
      setSaveError(null);
      setSaveWarning(null);
      setSaveSuccess(null);
    }
  }, [queryDate]);

  useEffect(() => {
    return () => {
      if (slowSaveTimeoutRef.current) clearTimeout(slowSaveTimeoutRef.current);
    };
  }, []);

  const clearSaveMessages = () => {
    setSaveError(null);
    setSaveWarning(null);
    setSaveSuccess(null);
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const selected = Array.from(fileList);
    if (selected.length > 3) {
      setSaveSuccess(null);
      setFileError("You can upload up to 3 receipts.");
      return;
    }

    const invalid = selected.find((file) => file.size > 5 * 1024 * 1024);
    if (invalid) {
      setSaveSuccess(null);
      setFileError(`"${invalid.name}" is larger than 5MB.`);
      return;
    }

    clearSaveMessages();
    setFileError(null);
    setReceipts(selected);
  };

  const handleAddCustomProject = () => {
    const normalized = customProjectName.trim();
    if (!normalized) return;

    const existing = availableProjects.find(
      (option) => option.toLowerCase() === normalized.toLowerCase(),
    );
    const projectToUse = existing ?? normalized;

    if (!existing) {
      setAvailableProjects((current) => [...current, projectToUse]);
    }

    setSelectedProjects((current) =>
      current.includes(projectToUse) ? current : [...current, projectToUse],
    );
    setCustomProjectName("");
    clearSaveMessages();
  };

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    if (!user) {
      setSaveSuccess(null);
      setSaveError("You must be signed in to save an entry.");
      return;
    }

    if (!DATE_KEY_PATTERN.test(entryDate)) {
      setSaveSuccess(null);
      setSaveError("Please select a valid date.");
      return;
    }

    if (fileError) {
      setSaveSuccess(null);
      setSaveError("Please resolve receipt upload issues before saving.");
      return;
    }

    const parsedTotal = Number(totalHours);
    const parsedRemote = remoteHours.trim() === "" ? 0 : Number(remoteHours);

    if (!Number.isFinite(parsedRemote) || parsedRemote < 0 || parsedRemote > 24) {
      setSaveSuccess(null);
      setSaveError("Remote hours must be between 0 and 24.");
      return;
    }

    if (parsedRemote > parsedTotal) {
      setSaveSuccess(null);
      setSaveError("Remote hours cannot be greater than total hours.");
      return;
    }

    setIsSaving(true);
    setSaveWarning(null);
    if (slowSaveTimeoutRef.current) clearTimeout(slowSaveTimeoutRef.current);
    slowSaveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
      setSaveWarning("Sync is taking longer than expected. Data may still be saved shortly.");
    }, 12000);

    try {
      await saveWorkEntry({
        date: entryDate,
        totalHours: parsedTotal,
        remoteHours: parsedRemote,
        projects: selectedProjects,
        description: description.trim(),
        receiptFileNames: receipts.map((file) => file.name),
      });

      setSaveError(null);
      setSaveWarning(null);
      setSaveSuccess("Entry saved successfully.");
    } catch (error) {
      setSaveSuccess(null);
      setSaveWarning(null);
      setSaveError(getEntryErrorMessage(error));
    } finally {
      if (slowSaveTimeoutRef.current) {
        clearTimeout(slowSaveTimeoutRef.current);
        slowSaveTimeoutRef.current = null;
      }
      setIsSaving(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      <Paper variant="outlined" sx={{ borderRadius: 3, overflow: "hidden" }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h2">{headerTitle}</Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
            {selectedDateLabel}
          </Typography>
        </Box>

        <Box sx={{ borderTop: "1px solid #e5e7eb", p: 3 }}>
          <Stack spacing={2.5}>
            {saveError && <Alert severity="error">{saveError}</Alert>}
            {saveWarning && <Alert severity="warning">{saveWarning}</Alert>}
            {saveSuccess && <Alert severity="success">{saveSuccess}</Alert>}

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Date{" "}
                <Typography component="span" variant="caption">
                  {entryDate === todayKey ? "Today" : "Selected"}
                </Typography>
              </Typography>
              <TextField
                fullWidth
                type="date"
                value={entryDate}
                onChange={(event) => {
                  setEntryDate(event.target.value);
                  clearSaveMessages();
                }}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Total Hours{" "}
                  <Typography component="span" variant="caption" sx={{ color: "#dc2626" }}>
                    *
                  </Typography>
                </Typography>
                <TextField
                  fullWidth
                  type="number"
                  placeholder="e.g. 8"
                  value={totalHours}
                  onChange={(event) => {
                    setTotalHours(event.target.value);
                    clearSaveMessages();
                  }}
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
                      onClick={() => {
                        setTotalHours(hours);
                        clearSaveMessages();
                      }}
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
                  onChange={(event) => {
                    setRemoteHours(event.target.value);
                    clearSaveMessages();
                  }}
                  sx={{ mt: 1 }}
                />
              </Box>
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Projects <Typography component="span" variant="caption">optional, multiple</Typography>
              </Typography>

              <FormControl fullWidth sx={{ mt: 1 }}>
                <InputLabel id="projects-select-label">Projects</InputLabel>
                <Select
                  labelId="projects-select-label"
                  multiple
                  value={selectedProjects}
                  onChange={(event) => {
                    const nextValue = event.target.value as string[];
                    setSelectedProjects(nextValue);
                    clearSaveMessages();
                  }}
                  input={<OutlinedInput label="Projects" />}
                  renderValue={(selected) => (selected.length === 0 ? "None" : selected.join(", "))}
                >
                  {availableProjects.map((option) => (
                    <MenuItem key={option} value={option}>
                      <Checkbox checked={selectedProjects.includes(option)} />
                      <ListItemText primary={option} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mt: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Add custom project"
                  value={customProjectName}
                  onChange={(event) => {
                    setCustomProjectName(event.target.value);
                    clearSaveMessages();
                  }}
                />
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={handleAddCustomProject}
                  disabled={customProjectName.trim() === ""}
                  sx={{ minWidth: 150 }}
                >
                  Add Custom
                </Button>
              </Stack>
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
                onChange={(event) => {
                  setDescription(event.target.value);
                  clearSaveMessages();
                }}
                sx={{ mt: 1 }}
              />
            </Box>

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                Expenses / Proof{" "}
                <Typography component="span" variant="caption">
                  optional - up to 3 receipts
                </Typography>
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
                <Button component="label" variant="text" startIcon={<UploadFileIcon />} sx={{ fontWeight: 700 }}>
                  Click to upload receipts
                  <input hidden type="file" accept="image/jpeg,image/png" multiple onChange={handleReceiptUpload} />
                </Button>
                <Typography variant="caption" sx={{ display: "block", mt: 0.75 }}>
                  Accepted: JPG/PNG, max 5MB each
                </Typography>

                {receipts.length > 0 && (
                  <Stack
                    direction="row"
                    spacing={1}
                    justifyContent="center"
                    sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 1 }}
                  >
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

        <Box
          sx={{
            borderTop: "1px solid #e5e7eb",
            p: 2.5,
            display: "flex",
            justifyContent: "flex-end",
            bgcolor: "#f8fafc",
          }}
        >
          <Button
            variant="contained"
            disabled={!canSave || isSaving || !user}
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
