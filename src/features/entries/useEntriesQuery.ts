import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { QueryClient } from "@tanstack/react-query";
import { getEntryLoadErrorMessage, subscribeToEntries } from "./entry.api";
import type { WorkEntry } from "./entry.types";

type EntriesOptions = {
  startDate?: string;
  endDate?: string;
  orderDirection?: "asc" | "desc";
  limitCount?: number;
};

export function entriesQueryKey(uid: string | null | undefined, opts: EntriesOptions) {
  return [
    "entries",
    uid ?? null,
    opts.startDate ?? null,
    opts.endDate ?? null,
    opts.orderDirection ?? "asc",
    opts.limitCount ?? null,
  ] as const;
}

type ErrorListener = (error: string | null) => void;

type CacheEntry = {
  refs: number;
  unsubscribe: () => void;
  errorListeners: Set<ErrorListener>;
  lastError: string | null;
};

const subscriptionCache = new Map<string, CacheEntry>();

function startSharedSubscription(
  uid: string,
  opts: EntriesOptions,
  queryClient: QueryClient,
  onError: ErrorListener,
): () => void {
  const key = entriesQueryKey(uid, opts);
  const cacheKey = JSON.stringify(key);
  const existing = subscriptionCache.get(cacheKey);

  if (existing) {
    existing.refs += 1;
    existing.errorListeners.add(onError);
    onError(existing.lastError);
    return () => releaseSubscription(cacheKey, onError);
  }

  const errorListeners = new Set<ErrorListener>([onError]);
  const entry: CacheEntry = {
    refs: 1,
    unsubscribe: () => undefined,
    errorListeners,
    lastError: null,
  };
  subscriptionCache.set(cacheKey, entry);

  entry.unsubscribe = subscribeToEntries(
    (entries) => {
      queryClient.setQueryData(key, entries);
      entry.lastError = null;
      errorListeners.forEach((cb) => cb(null));
    },
    (error) => {
      entry.lastError = getEntryLoadErrorMessage(error);
      errorListeners.forEach((cb) => cb(entry.lastError));
    },
    opts,
  );

  return () => releaseSubscription(cacheKey, onError);
}

function releaseSubscription(cacheKey: string, listener: ErrorListener) {
  const entry = subscriptionCache.get(cacheKey);
  if (!entry) return;
  entry.refs -= 1;
  entry.errorListeners.delete(listener);
  if (entry.refs <= 0) {
    entry.unsubscribe();
    subscriptionCache.delete(cacheKey);
  }
}

export function useEntriesQuery(
  uid: string | null | undefined,
  opts: EntriesOptions,
  enabled: boolean = true,
) {
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);
  const key = entriesQueryKey(uid, opts);

  useEffect(() => {
    if (!enabled || !uid) {
      setError(null);
      return;
    }
    return startSharedSubscription(uid, opts, queryClient, setError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    enabled,
    uid,
    opts.startDate,
    opts.endDate,
    opts.orderDirection,
    opts.limitCount,
    queryClient,
  ]);

  const query = useQuery<WorkEntry[]>({
    queryKey: key,
    enabled: Boolean(enabled && uid),
    // Data flows in via setQueryData from the shared snapshot listener; the
    // query function is a placeholder that never resolves on its own.
    queryFn: () => new Promise<WorkEntry[]>(() => {}),
    staleTime: Infinity,
  });

  return {
    entries: (query.data ?? []) as WorkEntry[],
    error,
    isLoading: enabled && Boolean(uid) && query.data === undefined && !error,
  };
}
