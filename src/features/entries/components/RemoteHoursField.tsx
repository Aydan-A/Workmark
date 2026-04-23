import { Chip, Stack, TextField, Typography } from "@mui/material";
import { Box } from "@mui/material";

type Props = {
  remoteHours: string;
  onChange: (value: string) => void;
};

export function RemoteHoursField({ remoteHours, onChange }: Props) {
  return (
    <Box>
      <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
        Remote Hours{" "}
        <Typography component="span" variant="caption" sx={{ color: "#dc2626" }}>
          *
        </Typography>
      </Typography>
      <TextField
        fullWidth
        type="number"
        placeholder="e.g. 6"
        value={remoteHours}
        onChange={(e) => onChange(e.target.value)}
        sx={{ mt: 1 }}
      />
      <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
        {["6", "8", "10"].map((hours) => (
          <Chip
            key={hours}
            label={`${hours}h`}
            clickable
            variant={remoteHours === hours ? "filled" : "outlined"}
            color={remoteHours === hours ? "primary" : "default"}
            onClick={() => onChange(hours)}
          />
        ))}
      </Stack>
    </Box>
  );
}
