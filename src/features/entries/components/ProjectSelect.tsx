import {
  Box,
  Button,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

type Props = {
  availableProjects: string[];
  selectedProjects: string[];
  customProjectName: string;
  onProjectsChange: (nextValue: string[]) => void;
  onCustomProjectNameChange: (value: string) => void;
  onAddCustomProject: () => void;
};

export function ProjectSelect({
  availableProjects,
  selectedProjects,
  customProjectName,
  onProjectsChange,
  onCustomProjectNameChange,
  onAddCustomProject,
}: Props) {
  return (
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
          onChange={(e) => onProjectsChange(e.target.value as string[])}
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
          onChange={(e) => onCustomProjectNameChange(e.target.value)}
        />
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={onAddCustomProject}
          disabled={customProjectName.trim() === ""}
          sx={{ minWidth: 150 }}
        >
          Add
        </Button>
      </Stack>
    </Box>
  );
}
