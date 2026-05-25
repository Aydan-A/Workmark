import { useEffect, useMemo, useState } from "react";
import type { User } from "firebase/auth";
import { endOfWeek, format, startOfWeek } from "date-fns";
import {
  subscribeToManagedUsers,
  type ManagedUser,
} from "../../profile/profile.api";
import { subscribeToEntriesForRange } from "../../entries/entry.api";
import type { WorkEntry } from "../../entries/entry.types";
import { getLast7DaysHours } from "../dashboard.utils";

export type ManagedTeamMember = {
  uid: string;
  fullName: string;
  email: string;
  totalHours: number;
  remoteHours: number;
  remotePct: number;
  weeklySpark: number[];
};

export function useManagedTeam(user: User | null) {
  const [managed, setManaged] = useState<ManagedUser[]>([]);
  const [entriesByUid, setEntriesByUid] = useState<Record<string, WorkEntry[]>>({});

  // Derive stable date keys once per render from a single now; downstream memos
  // and effects key off these strings rather than a live Date identity.
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const weekStartKey = format(startOfWeek(new Date(todayKey), { weekStartsOn: 1 }), "yyyy-MM-dd");
  const weekEndKey = format(endOfWeek(new Date(todayKey), { weekStartsOn: 1 }), "yyyy-MM-dd");

  useEffect(() => {
    const email = user?.email?.trim();
    if (!email) {
      // Reset stale managed-team data when there's no signed-in user. Functional
      // updaters keep an already-empty state a no-op (no extra render).
      setManaged((prev) => (prev.length === 0 ? prev : []));
      setEntriesByUid((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    return subscribeToManagedUsers(
      email,
      (users) => setManaged(users),
      (error) => console.error("Failed to load managed users:", error),
    );
  }, [user?.email]);

  useEffect(() => {
    if (managed.length === 0) {
      // Reset stale entries when there are no managed users (no-op if empty).
      setEntriesByUid((prev) => (Object.keys(prev).length === 0 ? prev : {}));
      return;
    }

    const unsubs = managed.map((u) =>
      subscribeToEntriesForRange(
        u.uid,
        weekStartKey,
        weekEndKey,
        (entries) => {
          setEntriesByUid((current) => ({ ...current, [u.uid]: entries }));
        },
        (error) => console.error(`Failed to load entries for ${u.uid}:`, error),
      ),
    );

    return () => {
      unsubs.forEach((u) => u());
    };
  }, [managed, weekStartKey, weekEndKey]);

  const referenceDate = useMemo(() => new Date(`${todayKey}T00:00:00`), [todayKey]);

  const team: ManagedTeamMember[] = useMemo(() => {
    return managed.map((u) => {
      const entries = entriesByUid[u.uid] ?? [];
      const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
      const remoteHours = entries
        .filter((e) => e.isRemote)
        .reduce((sum, e) => sum + e.hours, 0);
      const remotePct = totalHours > 0 ? Math.round((remoteHours / totalHours) * 100) : 0;
      const weeklySpark = getLast7DaysHours(entries, referenceDate);

      return {
        uid: u.uid,
        fullName: u.fullName,
        email: u.email,
        totalHours,
        remoteHours,
        remotePct,
        weeklySpark,
      };
    });
  }, [managed, entriesByUid, referenceDate]);

  return { team };
}
