import { Alert, Box, Button, Chip, Stack, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";

type Props = {
  receipts: File[];
  savedReceiptFileNames: string[];
  fileError: string | null;
  onUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

export function ReceiptUpload({ receipts, savedReceiptFileNames, fileError, onUpload }: Props) {
  return (
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
          <input hidden type="file" accept="image/jpeg,image/png" multiple onChange={onUpload} />
        </Button>
        <Typography variant="caption" sx={{ display: "block", mt: 0.75 }}>
          Accepted: JPG/PNG, max 5MB each
        </Typography>

        {(receipts.length > 0 || savedReceiptFileNames.length > 0) && (
          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            sx={{ mt: 1.25, flexWrap: "wrap", rowGap: 1 }}
          >
            {receipts.length > 0
              ? receipts.map((file) => <Chip key={file.name} label={file.name} />)
              : savedReceiptFileNames.map((fileName) => (
                  <Chip key={fileName} label={fileName} variant="outlined" />
                ))}
          </Stack>
        )}

        {savedReceiptFileNames.length > 0 && receipts.length === 0 && (
          <Typography variant="caption" sx={{ display: "block", mt: 0.75, color: "text.secondary" }}>
            Saved receipt names from this entry.
          </Typography>
        )}
      </Box>

      {fileError && (
        <Alert severity="warning" sx={{ mt: 1.5 }}>
          {fileError}
        </Alert>
      )}
    </Box>
  );
}
