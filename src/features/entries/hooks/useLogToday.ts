import { useEffect, useMemo, useState } from "react";
import { addDays, format, subDays } from "date-fns";
import { useParams, useSearchParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import {
  computeHours,
  createEntry,
  deleteEntry,
  getEntryErrorMessage,
  getEntryLoadErrorMessage,
  subscribeToEntriesForDate,
  updateEntry,
} from "../entry.api";
import { subscribeToProjects } from "../project.api";
import { deleteReceiptFile, movePendingReceipts } from "../receipt.api";
import { DATE_KEY_PATTERN, checkTimeOverlap, getTotalRemoteHours, parseDateKey } from "../entry.utils";
import type { Project, Receipt, SaveWorkEntryInput, WorkEntry } from "../entry.types";

export type ModalState =
  | { mode: "add"; entry?: undefined }
  | { mode: "edit"; entry: WorkEntry };

export type EntryFormData = {
  startTime: string;
  endTime: string;
  project: { id: string; name: string; color?: string };
  note: string;
  isRemote: boolean;
  receipts: Receipt[];
  removedReceiptPaths: string[];
};

export function useLogToday() {
  const { user } = useAuth();
  const params = useParams<{ date?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const candidateDate = params.date ?? searchParams.get("date");
  const initialDate =
    candidateDate && DATE_KEY_PATTERN.test(candidateDate) ? candidateDate : todayKey;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WorkEntry | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const goToDate = (date: string) => {
    setSelectedDate(date);
    const currentQuery = searchParams.get("date");
    if (date === todayKey) {
      if (currentQuery !== null) setSearchParams({}, { replace: true });
    } else if (currentQuery !== date) {
      setSearchParams({ date }, { replace: true });
    }
  };

  useEffect(() => {
    if (!user) {
      setEntries([]);
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setEntries([]);
    setLoadError(null);
    return subscribeToEntriesForDate(
      user.uid,
      selectedDate,
      (nextEntries) => {
        setEntries(nextEntries);
        setIsLoading(false);
        setLoadError(null);
      },
      (error) => {
        setLoadError(getEntryLoadErrorMessage(error));
        setIsLoading(false);
      },
    );
  }, [user, selectedDate]);

  // Key on uid so the projects subscription re-runs only when the user id
  // changes, not on every new user object identity from auth.
  const uid = user?.uid;
  useEffect(() => {
    if (!uid) {
      setProjects([]);
      return;
    }
    return subscribeToProjects(
      (nextProjects) => setProjects(nextProjects),
      () => {},
    );
  }, [uid]);

  const totalHours = useMemo(
    () => entries.reduce((sum, e) => sum + e.hours, 0),
    [entries],
  );

  const remoteHours = useMemo(() => getTotalRemoteHours(entries), [entries]);

  const officeHours = useMemo(
    () => totalHours - remoteHours,
    [totalHours, remoteHours],
  );

  const { defaultStartTime, defaultIsRemote } = useMemo(() => {
    const last = entries[entries.length - 1];
    return {
      defaultStartTime: last?.endTime ?? "09:00",
      defaultIsRemote: last?.isRemote ?? false,
    };
  }, [entries]);

  const selectedDateLabel = useMemo(
    () => format(parseDateKey(selectedDate), "EEEE, MMMM d, yyyy"),
    [selectedDate],
  );

  const isToday = selectedDate === todayKey;

  const goToPrevDay = () =>
    goToDate(format(subDays(parseDateKey(selectedDate), 1), "yyyy-MM-dd"));

  const goToNextDay = () =>
    goToDate(format(addDays(parseDateKey(selectedDate), 1), "yyyy-MM-dd"));

  const openAddModal = () => {
    setSaveError(null);
    setModal({ mode: "add" });
  };

  const openEditModal = (entry: WorkEntry) => {
    setSaveError(null);
    setModal({ mode: "edit", entry });
  };

  const closeModal = () => setModal(null);

  const openDeleteDialog = (entry: WorkEntry) => setPendingDelete(entry);

  const closeDeleteDialog = () => setPendingDelete(null);

  const saveEntry = async (data: EntryFormData): Promise<void> => {
    if (!user) {
      setSaveError("You must be signed in to save an entry.");
      return;
    }
    const otherEntries = entries.filter((e) =>
      modal?.mode === "edit" ? e.id !== modal.entry.id : true,
    );
    if (checkTimeOverlap(data.startTime, data.endTime, otherEntries)) {
      setSaveError("This time overlaps with an existing entry.");
      return;
    }
    setIsSaving(true);
    setSaveError(null);
    try {
      const input: SaveWorkEntryInput = {
        date: selectedDate,
        startTime: data.startTime,
        endTime: data.endTime,
        hours: computeHours(data.startTime, data.endTime),
        projectId: data.project.id,
        projectName: data.project.name,
        isRemote: data.isRemote,
        note: data.note.trim() || undefined,
      };
      if (modal?.mode === "edit" && modal.entry) {
        // Always include the receipts key so updateEntry can call deleteField()
        // when the user has removed all attachments.
        await updateEntry(user.uid, modal.entry.id, { ...input, receipts: data.receipts });
        if (data.removedReceiptPaths.length > 0) {
          await Promise.allSettled(data.removedReceiptPaths.map(deleteReceiptFile));
        }
      } else {
        const entryId = await createEntry(user.uid, input);
        if (data.receipts.length > 0) {
          const finalReceipts = await movePendingReceipts(user.uid, entryId, data.receipts);
          await updateEntry(user.uid, entryId, { receipts: finalReceipts });
        }
      }
      setProjects((prev) => {
        const nameLower = data.project.name.trim().toLowerCase();
        if (prev.some((p) => p.id === data.project.id || p.name.trim().toLowerCase() === nameLower)) return prev;
        const nowIso = new Date().toISOString();
        return [
          ...prev,
          {
            id: data.project.id,
            name: data.project.name,
            color: data.project.color,
            archived: false,
            createdAt: nowIso,
            updatedAt: nowIso,
          },
        ];
      });
      setModal(null);
    } catch (error) {
      setSaveError(getEntryErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async (): Promise<void> => {
    if (!user || !pendingDelete) return;
    setIsDeleting(true);
    setSaveError(null);
    try {
      await deleteEntry(user.uid, pendingDelete.id);
      setPendingDelete(null);
    } catch (error) {
      setSaveError(getEntryErrorMessage(error));
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    selectedDate,
    selectedDateLabel,
    isToday,
    entries,
    projects,
    isLoading,
    loadError,
    modal,
    pendingDelete,
    totalHours,
    remoteHours,
    officeHours,
    defaultStartTime,
    defaultIsRemote,
    goToPrevDay,
    goToNextDay,
    openAddModal,
    openEditModal,
    closeModal,
    openDeleteDialog,
    closeDeleteDialog,
    saveEntry,
    confirmDelete,
    isSaving,
    isDeleting,
    saveError,
  };
}
