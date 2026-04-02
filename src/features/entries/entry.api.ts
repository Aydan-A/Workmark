import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  type QueryConstraint,
  type Unsubscribe,
} from "firebase/firestore";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { auth, db } from "../../firebase/client";
import type { SaveWorkEntryInput, WorkEntry } from "./entry.types";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_PROJECTS = 10;
const MAX_RECEIPT_FILE_NAMES = 3;
const MAX_SHORT_TEXT_LENGTH = 120;
const MAX_DESCRIPTION_LENGTH = 2000;

function assertValidDateKey(date: string): string {
  const dateKey = date.trim();
  if (!DATE_KEY_PATTERN.test(dateKey)) {
    throw new Error("Invalid entry date. Use YYYY-MM-DD.");
  }
  return dateKey;
}

type EntrySubscriptionOptions = {
  startDate?: string;
  endDate?: string;
  orderDirection?: "asc" | "desc";
  limitCount?: number;
};

function assertAuthenticatedUserId(): string {
  const uid = auth.currentUser?.uid;
  if (!uid) {
    throw new Error("You must be signed in to access work entries.");
  }
  return uid;
}

function assertValidHours(value: number, fieldLabel: string): number {
  if (!Number.isFinite(value) || value < 0 || value > 24) {
    throw new Error(`${fieldLabel} must be between 0 and 24.`);
  }
  return value;
}

function normalizeStringList(
  values: string[],
  fieldLabel: string,
  maxItems: number,
  maxLength: number,
): string[] {
  const normalized = Array.from(
    new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)),
  );

  if (normalized.length > maxItems) {
    throw new Error(`${fieldLabel} cannot exceed ${maxItems} items.`);
  }

  if (normalized.some((value) => value.length > maxLength)) {
    throw new Error(`${fieldLabel} items must be ${maxLength} characters or fewer.`);
  }

  return normalized;
}

function normalizeReceiptFileNames(fileNames: string[]): string[] {
  return normalizeStringList(
    fileNames.map((name) => name.replace(/[\\/\u0000-\u001F\u007F]+/g, "_")),
    "Receipt filenames",
    MAX_RECEIPT_FILE_NAMES,
    MAX_SHORT_TEXT_LENGTH,
  );
}

export async function saveWorkEntry(input: SaveWorkEntryInput): Promise<void> {
  // Derive the target user from the active auth session instead of trusting a caller-supplied uid.
  // Firestore rules must still enforce ownership, but this removes an easy footgun in app code.
  const uid = assertAuthenticatedUserId();
  const dateKey = assertValidDateKey(input.date);
  const totalHours = assertValidHours(input.totalHours, "Total hours");
  const remoteHours = assertValidHours(input.remoteHours, "Remote hours");
  if (remoteHours > totalHours) {
    throw new Error("Remote hours cannot be greater than total hours.");
  }

  const projects = normalizeStringList(
    input.projects,
    "Projects",
    MAX_PROJECTS,
    MAX_SHORT_TEXT_LENGTH,
  );
  const receiptFileNames = normalizeReceiptFileNames(input.receiptFileNames);
  const description = input.description.trim();
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    throw new Error(`Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`);
  }

  const nowIso = new Date().toISOString();

  const entryDoc = doc(db, "users", uid, "entries", dateKey);
  const payload: WorkEntry = {
    date: dateKey,
    totalHours,
    remoteHours,
    projects,
    description,
    receiptFileNames,
    updatedAt: nowIso,
  };

  await setDoc(entryDoc, payload, { merge: true });
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

  constraints.push(orderBy("date", options.orderDirection ?? "asc"));

  if (options.limitCount) {
    constraints.push(limit(options.limitCount));
  }

  const entriesRef = collection(db, "users", uid, "entries");
  const entriesQuery = query(entriesRef, ...constraints);

  return onSnapshot(
    entriesQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((docSnapshot) => docSnapshot.data() as WorkEntry);
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
  const monthStartKey = format(startOfMonth(visibleMonth), "yyyy-MM-dd");
  const monthEndKey = format(endOfMonth(visibleMonth), "yyyy-MM-dd");

  return subscribeToEntries(onData, onError, {
    startDate: monthStartKey,
    endDate: monthEndKey,
    orderDirection: "asc",
  });
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
    if (error instanceof Error && error.message) return error.message;
    return "Could not load your entries. Please try again.";
  }

  switch (error.code) {
    case "permission-denied":
      return "You do not have permission to view these entries.";
    case "unauthenticated":
      return "Please sign in again and try loading your entries.";
    case "unavailable":
      return "Service is temporarily unavailable. Try again.";
    default:
      return "Could not load your entries. Please try again.";
  }
}
