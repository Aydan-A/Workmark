import { FirebaseError } from "firebase/app";
import {
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
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

export function subscribeToMonthEntries(
  uid: string,
  visibleMonth: Date,
  onData: (entries: WorkEntry[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  const monthStartKey = format(startOfMonth(visibleMonth), "yyyy-MM-dd");
  const monthEndKey = format(endOfMonth(visibleMonth), "yyyy-MM-dd");

  const entriesRef = collection(db, "users", uid, "entries");
  const monthQuery = query(
    entriesRef,
    where("date", ">=", monthStartKey),
    where("date", "<=", monthEndKey),
    orderBy("date", "asc"),
  );

  return onSnapshot(
    monthQuery,
    (snapshot) => {
      const entries = snapshot.docs.map((docSnapshot) => docSnapshot.data() as WorkEntry);
      onData(entries);
    },
    (error) => {
      onError?.(error);
    },
  );
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
