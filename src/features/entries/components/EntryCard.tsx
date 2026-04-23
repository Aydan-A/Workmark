import { Box, Chip, IconButton, Paper, Typography } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import type { WorkEntry } from "../entry.types";
import { formatHours } from "../entry.utils";

type Props = {
  entry: WorkEntry;
  onEdit: (entry: WorkEntry) => void;
  onDelete: (entry: WorkEntry) => void;
};

const COLOR_PALETTE = [
  "#7057f6", "#f59e0b", "#10b981", "#ef4444",
  "#3b82f6", "#ec4899", "#8b5cf6", "#06b6d4",
];

function projectColor(projectId: string): string {
  let h = 0;
  for (let i = 0; i < projectId.length; i++) {
    h = (Math.imul(31, h) + projectId.charCodeAt(i)) | 0;
  }
  return COLOR_PALETTE[Math.abs(h) % COLOR_PALETTE.length];
}

export function EntryCard({ entry, onEdit, onDelete }: Props) {
  const color = projectColor(entry.projectId);

  return (
    <Paper variant="outlined" sx={{ px: 2, py: 1.75, borderRadius: "16px" }}>
      <Box sx={{ display: "flex", gap: 2, alignItems: "flex-start" }}>
        {/* Left: time range + duration */}
        <Box sx={{ minWidth: 88, flexShrink: 0 }}>
          <Typography
            variant="body2"
            sx={{ fontWeight: 600, color: "text.primary", whiteSpace: "nowrap" }}
          >
            {entry.startTime} – {entry.endTime}
          </Typography>
          <Typography variant="caption" sx={{ color: "text.secondary", display: "block" }}>
            {formatHours(entry.hours)}
          </Typography>
        </Box>

        {/* Middle content + icons */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: { xs: "column", sm: "row" },
            gap: 1,
            alignItems: { sm: "flex-start" },
          }}
        >
          {/* Project name + Remote badge + note */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Box
                sx={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  bgcolor: color,
                  flexShrink: 0,
                }}
              />
              <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
                {entry.projectName}
              </Typography>
              {entry.isRemote && (
                <Chip
                  label="Remote"
                  size="small"
                  color="primary"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.7rem", borderRadius: "999px" }}
                />
              )}
            </Box>
            {entry.note && (
              <Typography
                variant="caption"
                sx={{
                  color: "text.secondary",
                  display: "block",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  mt: 0.5,
                }}
              >
                {entry.note}
              </Typography>
            )}
          </Box>

          {/* Edit + Delete icons */}
          <Box
            sx={{
              display: "flex",
              gap: 0.25,
              alignSelf: { xs: "flex-end", sm: "flex-start" },
              ml: { xs: "auto", sm: 0 },
              flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={() => onEdit(entry)}
              aria-label="Edit entry"
            >
              <EditIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onDelete(entry)}
              aria-label="Delete entry"
              color="error"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}
