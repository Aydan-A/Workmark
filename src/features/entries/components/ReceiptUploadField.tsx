import { useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import CloseIcon from "@mui/icons-material/Close";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import type { UploadTask } from "firebase/storage";
import { uploadReceiptFile } from "../receipt.api";
import type { Receipt } from "../entry.types";

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;

type UploadItem = {
  localId: string;
  file: File;
  previewUrl: string;
  progress: number;
  error: string | null;
};

type Props = {
  value: Receipt[];
  entryId: string | null;
  uid: string;
  onChange: (receipts: Receipt[]) => void;
  onUploading?: (uploading: boolean) => void;
  disabled?: boolean;
};

export function ReceiptUploadField({ value, entryId, uid, onChange, onUploading, disabled }: Props) {
  const [uploadItems, setUploadItems] = useState<UploadItem[]>([]);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  // Reactive copy of previewUrlsRef, read during render. The ref remains the
  // source of truth for object-URL cleanup (it survives across renders and is
  // accessible from unmount). State mirrors it so thumbnails update reactively.
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map());

  const fileInputRef = useRef<HTMLInputElement>(null);
  const tasksRef = useRef<Map<string, UploadTask>>(new Map());
  const previewUrlsRef = useRef<Map<string, string>>(new Map()); // receiptId → localObjectURL
  const valueRef = useRef<Receipt[]>(value);

  useEffect(() => {
    valueRef.current = value;
  }, [value]);

  useEffect(() => {
    onUploading?.(uploadItems.some((u) => !u.error));
  }, [uploadItems, onUploading]);

  useEffect(() => {
    // Capture the ref Maps now; their identity is stable for the component's
    // lifetime, so the cleanup closes over the same live Maps it would at unmount.
    const tasks = tasksRef.current;
    const previewUrlMap = previewUrlsRef.current;
    return () => {
      tasks.forEach((task) => task.cancel());
      previewUrlMap.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const activeCount = value.length + uploadItems.filter((u) => !u.error).length;
  const canAddMore = activeCount < MAX_FILES && !disabled;

  function validateFiles(files: FileList | File[]): { valid: File[]; errors: string[] } {
    const valid: File[] = [];
    const errors: string[] = [];
    const fileArr = Array.from(files);
    const available = MAX_FILES - activeCount;

    if (fileArr.length > available) {
      errors.push(`Maximum ${MAX_FILES} documents per entry. ${available} slot${available !== 1 ? "s" : ""} remaining.`);
      fileArr.splice(available);
    }

    for (const file of fileArr) {
      if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
        errors.push(`"${file.name}" — only images and PDFs are allowed.`);
        continue;
      }
      if (file.size > MAX_BYTES) {
        errors.push(`"${file.name}" — file must be 5 MB or less.`);
        continue;
      }
      valid.push(file);
    }
    return { valid, errors };
  }

  function startUpload(file: File) {
    const localId = crypto.randomUUID();
    const previewUrl = file.type.startsWith("image/") ? URL.createObjectURL(file) : "";

    setUploadItems((prev) => [
      ...prev,
      { localId, file, previewUrl, progress: 0, error: null },
    ]);

    const { task, partialReceipt } = uploadReceiptFile(file, uid, entryId);
    tasksRef.current.set(localId, task);

    task.on(
      "state_changed",
      (snapshot) => {
        const pct = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setUploadItems((prev) =>
          prev.map((u) => (u.localId === localId ? { ...u, progress: pct } : u)),
        );
      },
      (error) => {
        tasksRef.current.delete(localId);
        if (error.code === "storage/canceled") {
          setUploadItems((prev) => prev.filter((u) => u.localId !== localId));
          return;
        }
        setUploadItems((prev) =>
          prev.map((u) =>
            u.localId === localId ? { ...u, error: "Upload failed. Try again." } : u,
          ),
        );
      },
      () => {
        tasksRef.current.delete(localId);
        const receipt: Receipt = {
          ...partialReceipt,
          uploadedAt: new Date().toISOString(),
        };
        if (previewUrl) {
          previewUrlsRef.current.set(receipt.id, previewUrl);
          setPreviewUrls((prev) => new Map(prev).set(receipt.id, previewUrl));
        }
        setUploadItems((prev) => prev.filter((u) => u.localId !== localId));
        // Update valueRef immediately to prevent stale-closure race when multiple
        // uploads complete in the same tick.
        const next = [...valueRef.current, receipt];
        valueRef.current = next;
        onChange(next);
      },
    );
  }

  function handleFiles(files: FileList | File[]) {
    setFieldError(null);
    const { valid, errors } = validateFiles(files);
    if (errors.length > 0) setFieldError(errors.join(" "));
    valid.forEach(startUpload);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files) handleFiles(e.target.files);
    e.target.value = "";
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    if (canAddMore) handleFiles(e.dataTransfer.files);
  }

  function handleRemoveUploading(localId: string) {
    tasksRef.current.get(localId)?.cancel();
    tasksRef.current.delete(localId);
    setUploadItems((prev) => prev.filter((u) => u.localId !== localId));
  }

  function handleRemoveReceipt(receipt: Receipt) {
    if (previewUrlsRef.current.has(receipt.id)) {
      URL.revokeObjectURL(previewUrlsRef.current.get(receipt.id)!);
      previewUrlsRef.current.delete(receipt.id);
      setPreviewUrls((prev) => {
        const next = new Map(prev);
        next.delete(receipt.id);
        return next;
      });
    }
    const next = valueRef.current.filter((r) => r.id !== receipt.id);
    valueRef.current = next;
    onChange(next);
  }

  const showDropZone = canAddMore;

  return (
    <Box>
      {/* Drop zone */}
      {showDropZone && (
        <Box
          onClick={() => fileInputRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          sx={{
            border: "1.5px dashed",
            borderColor: isDragging ? "primary.main" : "divider",
            borderRadius: 2,
            p: 2,
            textAlign: "center",
            cursor: disabled ? "not-allowed" : "pointer",
            bgcolor: isDragging ? "action.hover" : "transparent",
            transition: "border-color 0.15s, background-color 0.15s",
            "&:hover": disabled ? {} : { borderColor: "primary.main", bgcolor: "action.hover" },
          }}
        >
          <Typography variant="caption" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
            Click to upload or drag documents here
            <br />
            Up to {MAX_FILES} · max 5 MB · Images or PDF
          </Typography>
        </Box>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,application/pdf"
        multiple
        hidden
        onChange={handleInputChange}
        disabled={disabled}
      />

      {fieldError && (
        <Typography variant="caption" sx={{ color: "error.main", mt: 0.75, display: "block" }}>
          {fieldError}
        </Typography>
      )}

      {/* Thumbnail strip */}
      {(value.length > 0 || uploadItems.length > 0) && (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5 }}>
          {/* Committed receipts */}
          {value.map((receipt) => (
            <ReceiptThumb
              key={receipt.id}
              receipt={receipt}
              previewUrl={previewUrls.get(receipt.id) ?? null}
              onRemove={() => handleRemoveReceipt(receipt)}
              disabled={disabled}
            />
          ))}

          {/* In-progress uploads */}
          {uploadItems.map((item) => (
            <Box
              key={item.localId}
              sx={{
                position: "relative",
                width: 64,
                height: 64,
                borderRadius: 1.5,
                overflow: "hidden",
                border: "1px solid",
                borderColor: item.error ? "error.main" : "divider",
                bgcolor: "grey.100",
                flexShrink: 0,
              }}
            >
              {item.previewUrl ? (
                <Box
                  component="img"
                  src={item.previewUrl}
                  alt={item.file.name}
                  sx={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              ) : (
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
                  <PictureAsPdfIcon sx={{ color: "text.secondary", fontSize: 28 }} />
                </Box>
              )}

              {/* Progress overlay */}
              {!item.error && item.progress < 100 && (
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: "scrim.light",
                    px: 0.5,
                    pb: 0.5,
                    pt: 0.25,
                  }}
                >
                  <LinearProgress
                    variant="determinate"
                    value={item.progress}
                    sx={{ height: 3, borderRadius: 2 }}
                  />
                </Box>
              )}

              {/* Error or cancel button */}
              <IconButton
                size="small"
                onClick={() => handleRemoveUploading(item.localId)}
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  p: 0.25,
                  bgcolor: "scrim.medium",
                  color: "common.white",
                  "&:hover": { bgcolor: "scrim.heavy" },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
}

// ---------------------------------------------------------------------------
// ReceiptThumb — renders a single committed receipt tile
// ---------------------------------------------------------------------------
function ReceiptThumb({
  receipt,
  previewUrl,
  onRemove,
  disabled,
}: {
  receipt: Receipt;
  previewUrl: string | null;
  onRemove: () => void;
  disabled?: boolean;
}) {
  const isImage = receipt.contentType.startsWith("image/");

  return (
    <Box
      sx={{
        position: "relative",
        width: 64,
        height: 64,
        borderRadius: 1.5,
        overflow: "hidden",
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "grey.100",
        flexShrink: 0,
        cursor: "default",
      }}
    >
      {isImage && previewUrl ? (
        <Box
          component="img"
          src={previewUrl}
          alt={receipt.fileName}
          sx={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
            px: 0.5,
            gap: 0.25,
          }}
        >
          <PictureAsPdfIcon sx={{ color: "text.secondary", fontSize: isImage ? 28 : 22 }} />
          <Typography
            variant="caption"
            sx={{
              fontSize: "0.6rem",
              color: "text.secondary",
              textAlign: "center",
              overflow: "hidden",
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              lineHeight: 1.2,
            }}
          >
            {receipt.fileName}
          </Typography>
        </Box>
      )}

      {!disabled && (
        <IconButton
          size="small"
          onClick={onRemove}
          aria-label={`Remove ${receipt.fileName}`}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            p: 0.25,
            bgcolor: "scrim.medium",
            color: "common.white",
            "&:hover": { bgcolor: "scrim.heavy" },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Box>
  );
}
