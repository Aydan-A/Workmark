import { Alert, Box, Button, IconButton, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import { useLogToday } from "../features/entries/hooks/useLogToday";
import { DaySummaryRow } from "../features/entries/components/DaySummaryRow";
import { EntryCard } from "../features/entries/components/EntryCard";
import { EntryModal } from "../features/entries/components/EntryModal";

export default function LogToday() {
  const {
    selectedDateLabel,
    isToday,
    entries,
    projects,
    loadError,
    totalHours,
    remoteHours,
    officeHours,
    modal,
    defaultStartTime,
    defaultIsRemote,
    isSaving,
    saveError,
    goToPrevDay,
    goToNextDay,
    openAddModal,
    openEditModal,
    openDeleteDialog,
    closeModal,
    saveEntry,
  } = useLogToday();

  return (
    <Box sx={{ maxWidth: 860, mx: "auto" }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h2" sx={{ mb: 1 }}>
          Log today
        </Typography>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <IconButton size="small" onClick={goToPrevDay} aria-label="Previous day">
            <ChevronLeftIcon />
          </IconButton>
          <Typography
            variant="body2"
            sx={{
              color: isToday ? "primary.main" : "text.secondary",
              fontWeight: isToday ? 600 : 400,
              minWidth: 220,
              textAlign: "center",
            }}
          >
            {selectedDateLabel}
          </Typography>
          <IconButton size="small" onClick={goToNextDay} aria-label="Next day">
            <ChevronRightIcon />
          </IconButton>
        </Box>
      </Box>

      {loadError && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          {loadError}
        </Alert>
      )}

      {entries.length === 0 ? (
        <Box
          sx={{
            textAlign: "center",
            py: 10,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Typography variant="body1" sx={{ color: "text.secondary" }}>
            No entries yet today
          </Typography>
          <Button variant="contained" startIcon={<AddIcon />} onClick={openAddModal}>
            Add entry
          </Button>
        </Box>
      ) : (
        <Box>
          <DaySummaryRow
            totalHours={totalHours}
            remoteHours={remoteHours}
            officeHours={officeHours}
          />
          <Stack spacing={1.5} sx={{ mb: 2 }}>
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                onEdit={openEditModal}
                onDelete={openDeleteDialog}
              />
            ))}
          </Stack>
          <Box sx={{ display: "flex", justifyContent: "center" }}>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={openAddModal}>
              Add entry
            </Button>
          </Box>
        </Box>
      )}

      {modal && (
        <EntryModal
          open
          mode={modal.mode}
          initialEntry={modal.entry}
          defaultStartTime={defaultStartTime}
          defaultIsRemote={defaultIsRemote}
          projects={projects}
          onSave={saveEntry}
          onClose={closeModal}
          isSaving={isSaving}
          saveError={saveError}
        />
      )}
    </Box>
  );
}
