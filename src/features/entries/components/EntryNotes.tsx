import { Box, TextField, Typography } from "@mui/material";

type Props = {
  description: string;
  onChange: (value: string) => void;
};

export function EntryNotes({ description, onChange }: Props) {
  return (
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
        onChange={(e) => onChange(e.target.value)}
        sx={{ mt: 1 }}
      />
    </Box>
  );
}
