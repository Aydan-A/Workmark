import { Alert, Box, Stack, TextField, Typography } from "@mui/material";
import { RemoteHoursField } from "./RemoteHoursField";
import { ProjectSelect } from "./ProjectSelect";
import { EntryNotes } from "./EntryNotes";
import { ReceiptUpload } from "./ReceiptUpload";

type Props = {
  todayKey: string;
  entryDate: string;
  remoteHours: string;
  availableProjects: string[];
  selectedProjects: string[];
  customProjectName: string;
  description: string;
  receipts: File[];
  savedReceiptFileNames: string[];
  fileError: string | null;
  loadError: string | null;
  saveError: string | null;
  saveWarning: string | null;
  saveSuccess: string | null;
  onDateChange: (value: string) => void;
  onRemoteHoursChange: (value: string) => void;
  onProjectsChange: (nextValue: string[]) => void;
  onCustomProjectNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onAddCustomProject: () => void;
  onReceiptUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function EntryForm({
  todayKey,
  entryDate,
  remoteHours,
  availableProjects,
  selectedProjects,
  customProjectName,
  description,
  receipts,
  savedReceiptFileNames,
  fileError,
  loadError,
  saveError,
  saveWarning,
  saveSuccess,
  onDateChange,
  onRemoteHoursChange,
  onProjectsChange,
  onCustomProjectNameChange,
  onDescriptionChange,
  onAddCustomProject,
  onReceiptUpload,
}: Props) {
  return (
    <Box sx={{ borderTop: "1px solid #e5e7eb", p: 3 }}>
      <Stack spacing={2.5}>
        {loadError && <Alert severity="warning">{loadError}</Alert>}
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
            onChange={(e) => onDateChange(e.target.value)}
            sx={{ mt: 1 }}
          />
        </Box>

        <RemoteHoursField remoteHours={remoteHours} onChange={onRemoteHoursChange} />

        <ProjectSelect
          availableProjects={availableProjects}
          selectedProjects={selectedProjects}
          customProjectName={customProjectName}
          onProjectsChange={onProjectsChange}
          onCustomProjectNameChange={onCustomProjectNameChange}
          onAddCustomProject={onAddCustomProject}
        />

        <EntryNotes description={description} onChange={onDescriptionChange} />

        <ReceiptUpload
          receipts={receipts}
          savedReceiptFileNames={savedReceiptFileNames}
          fileError={fileError}
          onUpload={onReceiptUpload}
        />
      </Stack>
    </Box>
  );
}
