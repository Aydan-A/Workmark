import { Box, Button, Paper, Typography } from "@mui/material";
import { useLogToday } from "../features/entries/hooks/useLogToday";
import { EntryForm } from "../features/entries/components/EntryForm";

export default function LogToday() {
  const {
    user,
    todayKey,
    entryDate,
    headerTitle,
    selectedDateLabel,
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
    isSaving,
    canSave,
    handleDateChange,
    handleRemoteHoursChange,
    handleProjectsChange,
    handleCustomProjectNameChange,
    handleDescriptionChange,
    handleReceiptUpload,
    handleAddCustomProject,
    handleSave,
  } = useLogToday();

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      <Paper variant="outlined" sx={{ borderRadius: "24px", borderColor: "rgba(255,255,255,0.8)", overflow: "hidden" }}>
        <Box sx={{ p: 3 }}>
          <Typography variant="h2">{headerTitle}</Typography>
          <Typography variant="body2" sx={{ color: "#94a3b8", mt: 0.5 }}>
            {selectedDateLabel}
          </Typography>
        </Box>

        <EntryForm
          todayKey={todayKey}
          entryDate={entryDate}
          remoteHours={remoteHours}
          availableProjects={availableProjects}
          selectedProjects={selectedProjects}
          customProjectName={customProjectName}
          description={description}
          receipts={receipts}
          savedReceiptFileNames={savedReceiptFileNames}
          fileError={fileError}
          loadError={loadError}
          saveError={saveError}
          saveWarning={saveWarning}
          saveSuccess={saveSuccess}
          onDateChange={handleDateChange}
          onRemoteHoursChange={handleRemoteHoursChange}
          onProjectsChange={handleProjectsChange}
          onCustomProjectNameChange={handleCustomProjectNameChange}
          onDescriptionChange={handleDescriptionChange}
          onAddCustomProject={handleAddCustomProject}
          onReceiptUpload={handleReceiptUpload}
        />

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
