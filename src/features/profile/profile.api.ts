import type { User } from "firebase/auth";
import {
  doc,
  onSnapshot,
  setDoc,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "../../firebase/client";
import { assertAuthenticatedUserId } from "../../firebase/auth";

export type UserProfileDocument = {
  fullName?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  language?: string;
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

  await setDoc(
    profileRef,
    {
      fullName: user.displayName?.trim() || "Alex Johnson",
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
