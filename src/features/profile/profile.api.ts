import type { User } from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  writeBatch,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../firebase/client";
import { assertAuthenticatedUserId } from "../../firebase/auth";
import { deleteEntryReceipts } from "../entries/receipt.api";

const FIRESTORE_BATCH_LIMIT = 500;

export type UserProfileDocument = {
  fullName?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  language?: string;
  managerEmail?: string;
  updatedAt?: string;
};

function normalizeOptionalField(value: string | undefined) {
  return value?.trim() ?? "";
}

export function subscribeToUserProfile(
  onData: (profile: UserProfileDocument | null) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  let uid: string;

  try {
    uid = assertAuthenticatedUserId();
  } catch (error) {
    onError?.(error);
    return () => undefined;
  }

  const profileRef = doc(db, "users", uid);

  return onSnapshot(
    profileRef,
    (snapshot) => {
      onData(snapshot.exists() ? (snapshot.data() as UserProfileDocument) : null);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function syncCurrentUserIdentity(user: User): Promise<void> {
  const uid = user.uid;
  const profileRef = doc(db, "users", uid);
  const fallbackName = user.email?.trim().split("@")[0] ?? "";

  await setDoc(
    profileRef,
    {
      fullName: user.displayName?.trim() || fallbackName,
      email: user.email?.trim().toLowerCase() || "",
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

export async function saveUserProfile(input: UserProfileDocument): Promise<void> {
  const uid = assertAuthenticatedUserId();
  const profileRef = doc(db, "users", uid);

  await setDoc(
    profileRef,
    {
      phone: normalizeOptionalField(input.phone),
      timezone: normalizeOptionalField(input.timezone),
      language: normalizeOptionalField(input.language),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}

async function batchDeleteDocs(snapshot: QuerySnapshot): Promise<void> {
  const docs = snapshot.docs;
  const batches: Promise<void>[] = [];
  for (let i = 0; i < docs.length; i += FIRESTORE_BATCH_LIMIT) {
    const batch = writeBatch(db);
    for (const docSnap of docs.slice(i, i + FIRESTORE_BATCH_LIMIT)) {
      batch.delete(docSnap.ref);
    }
    batches.push(batch.commit());
  }
  await Promise.all(batches);
}

export async function purgeUserData(uid: string): Promise<void> {
  const normalizedUid = uid.trim();
  if (!normalizedUid) {
    throw new Error("A user id is required to purge data.");
  }

  // Receipts must be deleted before the parent users/{uid} doc — Storage rules
  // require an authenticated owner, and deleteUser comes after this function.
  const entriesRef = collection(db, "users", normalizedUid, "entries");
  const projectsRef = collection(db, "users", normalizedUid, "projects");
  const [entriesSnap, projectsSnap] = await Promise.all([
    getDocs(entriesRef),
    getDocs(projectsRef),
  ]);

  await Promise.all([
    Promise.all(
      entriesSnap.docs.map((d) =>
        deleteEntryReceipts(normalizedUid, d.id, { strict: true }),
      ),
    ),
    batchDeleteDocs(entriesSnap),
    batchDeleteDocs(projectsSnap),
  ]);

  await deleteDoc(doc(db, "users", normalizedUid));
}

export async function saveManagerEmail(managerEmail: string): Promise<void> {
  const uid = assertAuthenticatedUserId();
  const profileRef = doc(db, "users", uid);

  await setDoc(
    profileRef,
    {
      managerEmail: managerEmail.trim(),
      updatedAt: new Date().toISOString(),
    },
    { merge: true },
  );
}
