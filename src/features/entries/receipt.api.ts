import {
  deleteObject,
  getBlob,
  getDownloadURL,
  listAll,
  ref,
  uploadBytes,
  uploadBytesResumable,
  type UploadTask,
} from "firebase/storage";
import { storage } from "../../firebase/client";
import type { Receipt } from "./entry.types";

export function uploadReceiptFile(
  file: File,
  uid: string,
  entryId: string | null,
): { task: UploadTask; partialReceipt: Omit<Receipt, "uploadedAt"> } {
  const receiptId = crypto.randomUUID();
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const storagePath = entryId
    ? `users/${uid}/receipts/${entryId}/${receiptId}.${ext}`
    : `users/${uid}/receipts/_pending/${receiptId}.${ext}`;
  const storageRef = ref(storage, storagePath);
  const task = uploadBytesResumable(storageRef, file, { contentType: file.type });
  return {
    task,
    partialReceipt: {
      id: receiptId,
      storagePath,
      fileName: file.name,
      contentType: file.type,
      sizeBytes: file.size,
    },
  };
}

// Downloads each _pending file client-side and re-uploads to the final path.
// TODO: replace with a server-side Cloud Function copy to avoid the round-trip.
export async function movePendingReceipts(
  uid: string,
  entryId: string,
  pendingReceipts: Receipt[],
): Promise<Receipt[]> {
  return Promise.all(
    pendingReceipts.map(async (receipt) => {
      const ext = receipt.storagePath.split(".").pop() ?? "bin";
      const newPath = `users/${uid}/receipts/${entryId}/${receipt.id}.${ext}`;
      const oldRef = ref(storage, receipt.storagePath);
      const newRef = ref(storage, newPath);
      const blob = await getBlob(oldRef);
      await uploadBytes(newRef, blob, { contentType: receipt.contentType });
      await deleteObject(oldRef);
      return { ...receipt, storagePath: newPath };
    }),
  );
}

export async function deleteReceiptFile(storagePath: string): Promise<void> {
  try {
    await deleteObject(ref(storage, storagePath));
  } catch {
    // Ignore — file may have already been deleted or never fully uploaded.
  }
}

export async function deleteEntryReceipts(uid: string, entryId: string): Promise<void> {
  try {
    const folderRef = ref(storage, `users/${uid}/receipts/${entryId}`);
    const { items } = await listAll(folderRef);
    await Promise.allSettled(items.map((item) => deleteObject(item)));
  } catch {
    // Best-effort cleanup; do not surface Storage errors on entry delete.
  }
}

export async function getReceiptDownloadUrl(storagePath: string): Promise<string> {
  return getDownloadURL(ref(storage, storagePath));
}
