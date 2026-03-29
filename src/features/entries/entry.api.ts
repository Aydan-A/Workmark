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
import { db } from "../../firebase/client";
import type { SaveWorkEntryInput, WorkEntry } from "./entry.types";

const DATE_KEY_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

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

export async function saveWorkEntry(input: SaveWorkEntryInput): Promise<void> {
  const dateKey = assertValidDateKey(input.date);
  const nowIso = new Date().toISOString();

  const entryDoc = doc(db, "users", input.uid, "entries", dateKey);
  const payload: WorkEntry = {
    date: dateKey,
    totalHours: input.totalHours,
    remoteHours: input.remoteHours,
    projects: input.projects,
    description: input.description,
    receiptFileNames: input.receiptFileNames,
    updatedAt: nowIso,
  };

  await setDoc(entryDoc, payload, { merge: true });
}

export function subscribeToEntries(
  uid: string,
  onData: (entries: WorkEntry[]) => void,
  onError?: (error: unknown) => void,
  options: EntrySubscriptionOptions = {},
): Unsubscribe {
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
  uid: string,
  visibleMonth: Date,
  onData: (entries: WorkEntry[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const monthStartKey = format(startOfMonth(visibleMonth), "yyyy-MM-dd");
  const monthEndKey = format(endOfMonth(visibleMonth), "yyyy-MM-dd");

  return subscribeToEntries(uid, onData, onError, {
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
