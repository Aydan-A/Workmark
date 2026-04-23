import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
  writeBatch,
  type Unsubscribe,
} from "firebase/firestore";
import { assertAuthenticatedUserId } from "../../firebase/auth";
import { db } from "../../firebase/client";
import type { Project, SaveProjectInput } from "./entry.types";

const MAX_PROJECT_NAME_LENGTH = 60;

function normalizeProjectName(name: string): string {
  const normalized = name.trim();
  if (normalized.length < 1 || normalized.length > MAX_PROJECT_NAME_LENGTH) {
    throw new Error(`Project name must be 1-${MAX_PROJECT_NAME_LENGTH} characters.`);
  }
  return normalized;
}

function normalizeOptionalColor(color: string | undefined): string | undefined {
  const normalized = color?.trim();
  return normalized ? normalized : undefined;
}

export function subscribeToProjects(
  onData: (projects: Project[]) => void,
  onError?: (error: unknown) => void,
): Unsubscribe {
  let uid: string;

  try {
    uid = assertAuthenticatedUserId();
  } catch (error) {
    onError?.(error);
    return () => undefined;
  }

  const projectsRef = collection(db, "users", uid, "projects");
  const projectsQuery = query(
    projectsRef,
    where("archived", "==", false),
    orderBy("name", "asc"),
  );

  return onSnapshot(
    projectsQuery,
    (snapshot) => {
      const projects = snapshot.docs.map((docSnapshot) => ({
        id: docSnapshot.id,
        ...(docSnapshot.data() as Omit<Project, "id">),
      }));
      onData(projects);
    },
    (error) => {
      onError?.(error);
    },
  );
}

export async function createProject(input: SaveProjectInput): Promise<string> {
  const uid = assertAuthenticatedUserId();
  const name = normalizeProjectName(input.name);
  const color = normalizeOptionalColor(input.color);
  const nowIso = new Date().toISOString();
  const projectsRef = collection(db, "users", uid, "projects");
  const docRef = await addDoc(projectsRef, {
    name,
    ...(color ? { color } : {}),
    archived: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  });
  return docRef.id;
}

export async function renameProject(projectId: string, newName: string): Promise<void> {
  const uid = assertAuthenticatedUserId();
  const normalizedProjectId = projectId.trim();
  const name = normalizeProjectName(newName);

  if (!normalizedProjectId) {
    throw new Error("A project id is required.");
  }

  const nowIso = new Date().toISOString();
  const batch = writeBatch(db);
  const projectRef = doc(db, "users", uid, "projects", normalizedProjectId);

  batch.update(projectRef, { name, updatedAt: nowIso });

  const entriesQuery = query(
    collection(db, "users", uid, "entries"),
    where("projectId", "==", normalizedProjectId),
  );
  const entriesSnapshot = await getDocs(entriesQuery);

  for (const docSnapshot of entriesSnapshot.docs) {
    batch.update(docSnapshot.ref, { projectName: name, updatedAt: nowIso });
  }

  await batch.commit();
}

export async function archiveProject(projectId: string): Promise<void> {
  const uid = assertAuthenticatedUserId();
  const normalizedProjectId = projectId.trim();

  if (!normalizedProjectId) {
    throw new Error("A project id is required.");
  }

  await updateDoc(doc(db, "users", uid, "projects", normalizedProjectId), {
    archived: true,
    updatedAt: new Date().toISOString(),
  });
}
