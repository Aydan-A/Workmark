import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  getEntryErrorMessage,
  getEntryLoadErrorMessage,
  saveWorkEntry,
  subscribeToEntry,
} from "../entry.api";
import { buildProjectId, buildTimeRangeFromHours } from "../entry.utils";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export const DEFAULT_PROJECT_OPTIONS = [
  "Customer Service",
  "Repair and Diagnostics",
  "Installation/Setup",
  "Warranty and Returns",
  "Sales Support",
  "Supplier/Brand Communication",
  "Parts and Inventory",
  "Product Testing/Quality Assurance",
  "Training and Documentation",
  "Website/Shopify/E-commerce",
  "Marketing/Content",
  "Internal Operations",
];

export function useLogToday() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const today = new Date();
  const todayKey = format(today, "yyyy-MM-dd");
  const todayLabel = format(today, "EEEE, MMMM d, yyyy");

  const queryDate = searchParams.get("date");
  const initialDate = queryDate && DATE_KEY_PATTERN.test(queryDate) ? queryDate : todayKey;

  const [entryDate, setEntryDate] = useState(initialDate);
  const [remoteHours, setRemoteHours] = useState("");
  const [availableProjects, setAvailableProjects] = useState<string[]>(DEFAULT_PROJECT_OPTIONS);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [customProjectName, setCustomProjectName] = useState("");
  const [description, setDescription] = useState("");
  const [receipts, setReceipts] = useState<File[]>([]);
  const [savedReceiptFileNames, setSavedReceiptFileNames] = useState<string[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveWarning, setSaveWarning] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const slowSaveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const canSave = useMemo(() => {
    if (remoteHours.trim() === "") return false;
    const parsed = Number(remoteHours);
    return Number.isFinite(parsed) && parsed >= 0 && parsed <= 24;
  }, [remoteHours]);

  const selectedDateLabel = useMemo(() => {
    if (!DATE_KEY_PATTERN.test(entryDate)) return todayLabel;
    const parsed = new Date(`${entryDate}T00:00:00`);
    if (Number.isNaN(parsed.getTime())) return todayLabel;
    return format(parsed, "EEEE, MMMM d, yyyy");
  }, [entryDate, todayLabel]);

  const headerTitle = entryDate === todayKey ? "Log Today" : "Log Entry";

  useEffect(() => {
    if (queryDate && DATE_KEY_PATTERN.test(queryDate)) {
      setEntryDate(queryDate);
      setLoadError(null);
      setSaveError(null);
      setSaveWarning(null);
      setSaveSuccess(null);
    }
  }, [queryDate]);

  useEffect(() => {
    if (!user || !DATE_KEY_PATTERN.test(entryDate)) {
      setLoadError(null);
      setRemoteHours("");
      setSelectedProjects([]);
      setCustomProjectName("");
      setDescription("");
      setReceipts([]);
      setSavedReceiptFileNames([]);
      setFileError(null);
      return;
    }

    const unsubscribe = subscribeToEntry(
      entryDate,
      (entry) => {
        setLoadError(null);

        if (!entry) {
          setRemoteHours("");
          setSelectedProjects([]);
          setCustomProjectName("");
          setDescription("");
          setReceipts([]);
          setSavedReceiptFileNames([]);
          setFileError(null);
          setAvailableProjects((current) => {
            const merged = [...DEFAULT_PROJECT_OPTIONS];
            for (const option of current) {
              if (!merged.includes(option)) merged.push(option);
            }
            return merged;
          });
          return;
        }

        const nextProjects = entry.projectName?.trim() ? [entry.projectName.trim()] : [];
        const nextRemoteHours = entry.hours > 0 ? String(entry.hours) : "";

        setRemoteHours(nextRemoteHours);
        setSelectedProjects(nextProjects);
        setCustomProjectName("");
        setDescription(entry.note ?? "");
        setReceipts([]);
        setSavedReceiptFileNames([]);
        setFileError(null);
        setAvailableProjects((current) => {
          const merged = [...DEFAULT_PROJECT_OPTIONS];
          for (const option of [...current, ...nextProjects]) {
            if (!merged.includes(option)) merged.push(option);
          }
          return merged;
        });
      },
      (error) => {
        setLoadError(getEntryLoadErrorMessage(error));
      },
    );

    return unsubscribe;
  }, [entryDate, user]);

  useEffect(() => {
    return () => {
      if (slowSaveTimeoutRef.current) clearTimeout(slowSaveTimeoutRef.current);
    };
  }, []);

  const clearSaveMessages = () => {
    setSaveError(null);
    setSaveWarning(null);
    setSaveSuccess(null);
  };

  const handleDateChange = (value: string) => {
    setEntryDate(value);
    clearSaveMessages();
  };

  const handleRemoteHoursChange = (value: string) => {
    setRemoteHours(value);
    clearSaveMessages();
  };

  const handleProjectsChange = (nextValue: string[]) => {
    setSelectedProjects(nextValue);
    clearSaveMessages();
  };

  const handleCustomProjectNameChange = (value: string) => {
    setCustomProjectName(value);
    clearSaveMessages();
  };

  const handleDescriptionChange = (value: string) => {
    setDescription(value);
    clearSaveMessages();
  };

  const handleReceiptUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (!fileList) return;

    const selected = Array.from(fileList);
    if (selected.length > 3) {
      setSaveSuccess(null);
      setFileError("You can upload up to 3 receipts.");
      return;
    }

    const invalid = selected.find((file) => file.size > 5 * 1024 * 1024);
    if (invalid) {
      setSaveSuccess(null);
      setFileError(`"${invalid.name}" is larger than 5MB.`);
      return;
    }

    clearSaveMessages();
    setFileError(null);
    setReceipts(selected);
    setSavedReceiptFileNames([]);
  };

  const handleAddCustomProject = () => {
    const normalized = customProjectName.trim();
    if (!normalized) return;

    const existing = availableProjects.find(
      (option) => option.toLowerCase() === normalized.toLowerCase(),
    );
    const projectToUse = existing ?? normalized;

    if (!existing) {
      setAvailableProjects((current) => [...current, projectToUse]);
    }

    setSelectedProjects((current) =>
      current.includes(projectToUse) ? current : [...current, projectToUse],
    );
    setCustomProjectName("");
    clearSaveMessages();
  };

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    if (!user) {
      setSaveSuccess(null);
      setSaveError("You must be signed in to save an entry.");
      return;
    }

    if (!DATE_KEY_PATTERN.test(entryDate)) {
      setSaveSuccess(null);
      setSaveError("Please select a valid date.");
      return;
    }

    if (fileError) {
      setSaveSuccess(null);
      setSaveError("Please resolve receipt upload issues before saving.");
      return;
    }

    const parsedRemote = Number(remoteHours);

    if (!Number.isFinite(parsedRemote) || parsedRemote <= 0 || parsedRemote >= 24) {
      setSaveSuccess(null);
      setSaveError("Remote hours must be greater than 0 and less than 24.");
      return;
    }

    setIsSaving(true);
    setSaveWarning(null);
    if (slowSaveTimeoutRef.current) clearTimeout(slowSaveTimeoutRef.current);
    slowSaveTimeoutRef.current = setTimeout(() => {
      setIsSaving(false);
      setSaveWarning("Sync is taking longer than expected. Data may still be saved shortly.");
    }, 12000);

    try {
      const primaryProject = selectedProjects[0] ?? customProjectName.trim() ?? "";
      const projectName = primaryProject || "General";
      const { startTime, endTime } = buildTimeRangeFromHours(parsedRemote);

      await saveWorkEntry({
        date: entryDate,
        startTime,
        endTime,
        hours: parsedRemote,
        projectId: buildProjectId(projectName),
        projectName,
        isRemote: true,
        note: description.trim() || undefined,
      });

      setSaveError(null);
      setSaveWarning(null);
      setSaveSuccess("Entry saved successfully.");
    } catch (error) {
      setSaveSuccess(null);
      setSaveWarning(null);
      setSaveError(getEntryErrorMessage(error));
    } finally {
      if (slowSaveTimeoutRef.current) {
        clearTimeout(slowSaveTimeoutRef.current);
        slowSaveTimeoutRef.current = null;
      }
      setIsSaving(false);
    }
  };

  return {
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
  };
}
