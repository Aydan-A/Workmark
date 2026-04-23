import { FirebaseError } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  limit,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import {
  differenceInMinutes,
  endOfMonth,
  format,
  parse,
  startOfMonth,
} from "date-fns";
import { assertAuthenticatedUserId } from "../../firebase/auth";
import { db } from "../../firebase/client";
import type { SaveWorkEntryInput, WorkEntry } from "./entry.types";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^\d{2}:\d{2}$/;
const MAX_SHORT_TEXT_LENGTH = 120;
const MAX_NOTE_LENGTH = 2000;

function assertValidDateKey(date: string): string {
  const dateKey = date.trim();
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new Error("Invalid entry date. Use YYYY-MM-DD.");
  }
  return dateKey;
}

function assertValidUserId(uid: string): string {
  const normalizedUid = uid.trim();
  if (!normalizedUid) {
    throw new Error("A user id is required.");
  }
  return normalizedUid;
}


function assertValidTime(value: string, fieldLabel: string): string {
  const normalized = value.trim();

  if (!TIME_PATTERN.test(normalized)) {
    throw new Error(`${fieldLabel} must use HH:mm.`);
  }

  const parsed = parse(normalized, "HH:mm", new Date());
  if (Number.isNaN(parsed.getTime())) {
    throw new Error(`${fieldLabel} must use HH:mm.`);
  }

  return normalized;
}

function assertValidShortText(value: string, fieldLabel: string): string {
  const normalized = value.trim();

  if (!normalized) {
    throw new Error(`${fieldLabel} is required.`);
  }

  if (normalized.length > MAX_SHORT_TEXT_LENGTH) {
    throw new Error(`${fieldLabel} must be ${MAX_SHORT_TEXT_LENGTH} characters or fewer.`);
  }

  return normalized;
}

function normalizeOptionalNote(note: string | undefined): string | undefined {
  const normalized = note?.trim();

  if (!normalized) return undefined;

  if (normalized.length > MAX_NOTE_LENGTH) {
    throw new Error(`Note must be ${MAX_NOTE_LENGTH} characters or fewer.`);
  }

  return normalized;
}

function normalizeBoolean(value: boolean, fieldLabel: string): boolean {
  if (typeof value !== "boolean") {
    throw new Error(`${fieldLabel} must be true or false.`);
  }

  return value;
}


function normalizeSaveInput(input: SaveWorkEntryInput): SaveWorkEntryInput {
  const date = assertValidDateKey(input.date);
  const startTime = assertValidTime(input.startTime, "Start time");
  const endTime = assertValidTime(input.endTime, "End time");
  const projectId = assertValidShortText(input.projectId, "Project");
  const projectName = assertValidShortText(input.projectName, "Project name");
  const isRemote = normalizeBoolean(input.isRemote, "Remote flag");
  const note = normalizeOptionalNote(input.note);
  const hours = computeHours(startTime, endTime);

  return {
    date,
    startTime,
    endTime,
    hours,
    projectId,
    projectName,
    isRemote,
    ...(note ? { note } : {}),
  };
}

type EntrySubscriptionOptions = {
  startDate?: string;
  endDate?: string;
  orderDirection?: "asc" | "desc";
  limitCount?: number;
};

export function computeHours(startTime: string, endTime: string): number {
  const normalizedStart = assertValidTime(startTime, "Start time");
  const normalizedEnd = assertValidTime(endTime, "End time");
  const start = parse(normalizedStart, "HH:mm", new Date());
  const end = parse(normalizedEnd, "HH:mm", new Date());
  const diffMinutes = differenceInMinutes(end, start);

  if (diffMinutes <= 0) {
    throw new Error("End time must be later than start time.");
  }

  return Number((diffMinutes / 60).toFixed(2));
}

export async function createEntry(uid: string, input: SaveWorkEntryInput): Promise<string> {
  const normalizedUid = assertValidUserId(uid);
  const normalizedInput = normalizeSaveInput(input);
  const nowIso = new Date().toISOString();
  const payload: Omit<WorkEntry, "id"> = {
    ...normalizedInput,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  const entriesRef = collection(db, "users", normalizedUid, "entries");
  const docRef = await addDoc(entriesRef, payload);
  return docRef.id;
}

export async function updateEntry(
  uid: string,
  entryId: string,
  updates: Partial<SaveWorkEntryInput>,
): Promise<void> {
  const normalizedUid = assertValidUserId(uid);
  const normalizedEntryId = entryId.trim();

  if (!normalizedEntryId) {
    throw new Error("An entry id is required.");
  }

  const entryRef = doc(db, "users", normalizedUid, "entries", normalizedEntryId);
  const snapshot = await getDoc(entryRef);

  if (!snapshot.exists()) {
    throw new Error("Entry not found.");
  }

  const currentEntry = snapshot.data() as Omit<WorkEntry, "id">;
  const nextStartTime = updates.startTime !== undefined
    ? assertValidTime(updates.startTime, "Start time")
    : currentEntry.startTime;
  const nextEndTime = updates.endTime !== undefined
    ? assertValidTime(updates.endTime, "End time")
    : currentEntry.endTime;

  const payload: Partial<SaveWorkEntryInput> & { updatedAt: string } = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.date !== undefined) {
    payload.date = assertValidDateKey(updates.date);
  }

  if (updates.startTime !== undefined) {
    payload.startTime = nextStartTime;
  }

  if (updates.endTime !== undefined) {
    payload.endTime = nextEndTime;
  }

  if (updates.projectId !== undefined) {
    payload.projectId = assertValidShortText(updates.projectId, "Project");
  }

  if (updates.projectName !== undefined) {
    payload.projectName = assertValidShortText(updates.projectName, "Project name");
  }

  if (updates.isRemote !== undefined) {
    payload.isRemote = normalizeBoolean(updates.isRemote, "Remote flag");
  }

  if (updates.note !== undefined) {
    const nextNote = normalizeOptionalNote(updates.note);
    payload.note = nextNote;
  }

  if (updates.startTime !== undefined || updates.endTime !== undefined) {
    payload.hours = computeHours(nextStartTime, nextEndTime);
  }

  await updateDoc(entryRef, payload);
}

export async function deleteEntry(uid: string, entryId: string): Promise<void> {
  const normalizedUid = assertValidUserId(uid);
  const normalizedEntryId = entryId.trim();

  if (!normalizedEntryId) {
    throw new Error("An entry id is required.");
  }

  await deleteDoc(doc(db, "users", normalizedUid, "entries", normalizedEntryId));
}

export async function saveWorkEntry(input: SaveWorkEntryInput): Promise<void> {
  const uid = assertAuthenticatedUserId();
  await createEntry(uid, input);
}

export function subscribeToEntry(
  date: string,
  onData: (entry: WorkEntry | null) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  let uid: string;

  try {
    uid = assertAuthenticatedUserId();
  } catch (error) {
    onError?.(error);
    return () => undefined;
  }

  return subscribeToEntriesForDate(
    uid,
    date,
    (entries) => {
      onData(entries[0] ?? null);
    },
    onError,
  );
}


export function subscribeToEntries(
  onData: (entries: WorkEntry[]) => void,
  onError?: (error: unknown) => void,
  options: EntrySubscriptionOptions = {},
): Unsubscribe {
  let uid: string;
  try {
    uid = assertAuthenticatedUserId();
  } catch (error) {
    onError?.(error);
    return () => undefined;
  }

  const constraints: QueryConstraint[] = [];

  if (options.startDate) {
    constraints.push(where("date", ">=", assertValidDateKey(options.startDate)));
  }

  if (options.endDate) {
    constraints.push(where("date", "<=", assertValidDateKey(options.endDate)));
  }

  if (options.startDate || options.endDate) {
    constraints.push(orderBy("date", options.orderDirection ?? "asc"));
    constraints.push(orderBy("startTime", options.orderDirection ?? "asc"));
  } else {
    constraints.push(orderBy("date", options.orderDirection ?? "asc"));
    constraints.push(orderBy("startTime", options.orderDirection ?? "asc"));
  }

  if (options.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  const entriesRef = collection(db, "users", uid, "entries");
  const entriesQuery = query(entriesRef, ...constraints);

  return onSnapshot(
    entriesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<WorkEntry, "id">),
      }));
      onData(entries);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export function subscribeToEntriesForDate(
  uid: string,
  date: string,
  onData: (entries: WorkEntry[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  let normalizedUid: string;
  let dateKey: string;

  try {
    normalizedUid = assertValidUserId(uid);
    dateKey = assertValidDateKey(date);
  } catch (error) {
    onError?.(error);
    return () => undefined;
  }

  const entriesRef = collection(db, "users", normalizedUid, "entries");
  const entriesQuery = query(
    entriesRef,
    where("date", "==", dateKey),
    orderBy("startTime", "asc"),
  );

  return onSnapshot(
    entriesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<WorkEntry, "id">),
      }));
      onData(entries);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export function subscribeToEntriesForRange(
  uid: string,
  startDate: string,
  endDate: string,
  onData: (entries: WorkEntry[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  let normalizedUid: string;
  let startDateKey: string;
  let endDateKey: string;

  try {
    normalizedUid = assertValidUserId(uid);
    startDateKey = assertValidDateKey(startDate);
    endDateKey = assertValidDateKey(endDate);
  } catch (error) {
    onError?.(error);
    return () => undefined;
  }

  const entriesRef = collection(db, "users", normalizedUid, "entries");
  const entriesQuery = query(
    entriesRef,
    where("date", ">=", startDateKey),
    where("date", "<=", endDateKey),
    orderBy("date", "asc"),
    orderBy("startTime", "asc"),
  );

  return onSnapshot(
    entriesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<WorkEntry, "id">),
      }));
      onData(entries);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export function subscribeToMonthEntries(
  visibleMonth: Date,
  onData: (entries: WorkEntry[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  let uid: string;

  try {
    uid = assertAuthenticatedUserId();
  } catch (error) {
    onError?.(error);
    return () => undefined;
  }

  const monthStartKey = format(startOfMonth(visibleMonth), "yyyy-MM-dd");
  const monthEndKey = format(endOfMonth(visibleMonth), "yyyy-MM-dd");

  return subscribeToEntriesForRange(uid, monthStartKey, monthEndKey, onData, onError);
}

export function getEntryErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    if (error instanceof Error && error.message) return error.message;
    return "Could not save your entry. Please try again.";
  }

  switch (error.code) {
    case "permission-denied":
      return "You do not have permission to save this entry.";
    case "unauthenticated":
      return "Please sign in again and try saving.";
    case "unavailable":
      return "Service is temporarily unavailable. Try again.";
    default:
      return "Could not save your entry. Please try again.";
  }
}

export function getEntryLoadErrorMessage(error: unknown): string {
  if (!(error instanceof FirebaseError)) {
    if (import.meta.env.DEV && error instanceof Error && error.message) {
      return `Entry load error: ${error.message}`;
    }
    return "Could not load your entries. Please try again.";
  }

  const devMessage = `Firestore entry load error (${error.code}): ${error.message}`;

  switch (error.code) {
    case "permission-denied":
      return import.meta.env.DEV ? devMessage : "You do not have permission to view these entries.";
    case "failed-precondition":
      return import.meta.env.DEV ? devMessage : "Entry data needs a Firestore index or setup update before it can load.";
    case "unauthenticated":
      return import.meta.env.DEV ? devMessage : "Please sign in again and try loading your entries.";
    case "unavailable":
      return import.meta.env.DEV ? devMessage : "Service is temporarily unavailable. Try again.";
    default:
      return import.meta.env.DEV ? devMessage : "Could not load your entries. Please try again.";
  }
}
