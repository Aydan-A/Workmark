import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { createFilterOptions } from "@mui/material/Autocomplete";
import { createProject } from "../project.api";
import type { Project } from "../entry.types";
import { projectColor } from "../../../styles/colors";

type ProjectValue = { id: string; name: string; color?: string };
type ProjectOption = ProjectValue & { isCreate?: true };

type Props = {
  projects: Project[];
  value: ProjectValue | null;
  onChange: (value: ProjectValue | null) => void;
  error?: string;
};

const filter = createFilterOptions<ProjectOption>();

export function ProjectAutocomplete({ projects, value, onChange, error }: Props) {
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const seen = new Set<string>();
  const options: ProjectOption[] = projects
    .filter((p) => {
      const key = p.name.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((p) => ({ id: p.id, name: p.name, color: p.color }));

  const handleChange = (_: React.SyntheticEvent, newValue: ProjectOption | null) => {
    if (!newValue) { onChange(null); return; }
    if (newValue.isCreate) {
      void handleCreate(newValue.name);
    } else {
      onChange({ id: newValue.id, name: newValue.name, color: newValue.color });
    }
  };

  const handleCreate = async (name: string) => {
    setCreating(true);
    setCreateError(null);
    try {
      const result = await createProject({ name });
      onChange({ id: result.id, name: result.name });
    } catch (error) {
      setCreateError(
        error instanceof Error ? error.message : "Could not create project. Try again.",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Autocomplete<ProjectOption>
        options={options}
        value={value ? { id: value.id, name: value.name, color: value.color } : null}
        onChange={handleChange}
        disabled={creating}
        openOnFocus
        getOptionLabel={(option) => option.name}
        isOptionEqualToValue={(option, val) => option.id === val.id}
        filterOptions={(opts, params) => {
          const filtered = filter(opts, params);
          const { inputValue } = params;
          const isExisting = opts.some(
            (o) => !o.isCreate && o.name.toLowerCase() === inputValue.toLowerCase(),
          );
          if (inputValue && !isExisting) {
            filtered.push({ id: "__create__", name: inputValue, isCreate: true });
          }
          return filtered;
        }}
        renderOption={(props, option) => {
          const { key, ...optionProps } = props as typeof props & { key: React.Key };
          return (
            <Box key={key} component="li" {...optionProps}>
              {option.isCreate ? (
                <Typography variant="body2" sx={{ color: "primary.main" }}>
                  + Create "{option.name}" as new project
                </Typography>
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor: option.color ?? projectColor(option.id),
                      flexShrink: 0,
                    }}
                  />
                  <Typography variant="body2">{option.name}</Typography>
                </Box>
              )}
            </Box>
          );
        }}
        renderInput={(params) => (
          <TextField
            {...params}
            label="Project"
            placeholder="Search or create a project"
            error={!!error}
            helperText={error}
            slotProps={{
              input: {
                ...params.InputProps,
                endAdornment: (
                  <>
                    {creating && <CircularProgress size={16} sx={{ mr: 0.5 }} />}
                    {params.InputProps.endAdornment}
                  </>
                ),
              },
            }}
          />
        )}
      />
      {createError && (
        <Typography variant="caption" sx={{ color: "error.main", mt: 0.5, display: "block" }}>
          {createError}
        </Typography>
      )}
    </Box>
  );
}
