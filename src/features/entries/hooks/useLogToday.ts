import { useEffect, useMemo, useState } from "react";
import { addDays, format, parse, subDays } from "date-fns";
import { useSearchParams } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import { getEntryLoadErrorMessage, subscribeToEntriesForDate } from "../entry.api";
import { subscribeToProjects } from "../project.api";
import type { Project, WorkEntry } from "../entry.types";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ModalState =
  | { mode: "add"; entry?: undefined }
  | { mode: "edit"; entry: WorkEntry };

export type EntryFormData = {
  startTime: string;
  endTime: string;
  project: { id: string; name: string; color?: string };
  note: string;
  isRemote: boolean;
};

function parseDateKey(dateKey: string): Date {
  return parse(dateKey, "yyyy-MM-dd", new Date());
}

export function useLogToday() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const todayKey = format(new Date(), "yyyy-MM-dd");
  const queryDate = searchParams.get("date");
  const initialDate =
    queryDate && DATE_KEY_PATTERN.test(queryDate) ? queryDate : todayKey;

  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState | null>(null);
  const [pendingDelete, setPendingDelete] = useState<WorkEntry | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const goToDate = (date: string) => {
    setSelectedDate(date);
    if (date === todayKey) {
      setSearchParams({}, { replace: true });
    } else {
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

  useEffect(() => {
    if (!user) {
      setProjects([]);
      return;
    }
    return subscribeToProjects(
      (nextProjects) => setProjects(nextProjects),
      () => setProjects([]),
    );
  }, [user]);

  const totalHours = useMemo(
    () => entries.reduce((sum, e) => sum + e.hours, 0),
    [entries],
  );

  const remoteHours = useMemo(
    () =>
      entries.filter((e) => e.isRemote).reduce((sum, e) => sum + e.hours, 0),
    [entries],
  );

  const officeHours = useMemo(
    () => totalHours - remoteHours,
    [totalHours, remoteHours],
  );

  const defaultStartTime = useMemo(() => {
    if (entries.length === 0) return "09:00";
    return entries[entries.length - 1].endTime;
  }, [entries]);

  const defaultIsRemote = useMemo(() => {
    if (entries.length === 0) return false;
    return entries[entries.length - 1].isRemote;
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

  const saveEntry = async (_data: EntryFormData): Promise<void> => {
    // Implemented in Commit 3
  };

  const confirmDelete = async (): Promise<void> => {
    // Implemented in Commit 4
    setPendingDelete(null);
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
    saveError,
  };
}
