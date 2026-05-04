export type Receipt = {
  id: string;
  storagePath: string;
  fileName: string;
  contentType: string;
  sizeBytes: number;
  uploadedAt: string;
};

export type WorkEntry = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  hours: number;
  projectId: string;
  projectName: string;
  isRemote: boolean;
  note?: string;
  receipts?: Receipt[];
  createdAt: string;
  updatedAt: string;
};

export type SaveWorkEntryInput = Omit<WorkEntry, "id" | "createdAt" | "updatedAt">;

export type Project = {
  id: string;
  name: string;
  color?: string;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SaveProjectInput = {
  name: string;
  color?: string;
};

export type DashboardLog = {
  id: string;
  title: string;
  location: string;
  summary: string;
  hours: number;
  dateLabel: string;
};

export type WeeklyPoint = {
  dateKey: string;
  day: string;
  dateLabel: string;
  hours: number;
  isToday: boolean;
};

export type WeeklyBusiestDay = {
  date: string;
  day: string;
  hours: number;
};

export type WeeklyTopProject = {
  name: string;
  hours: number;
  days: number;
};

export type TopProjectStat = {
  id: string;
  name: string;
  color: string | undefined;
  hours: number;
};

export type CompactDailyBreakdownRow = {
  date: string;
  day: string;
  dateLabel: string;
  hours: number;
  projectLabel: string;
  receiptCount: number;
};

export type HeatmapDay = {
  dateKey: string;
  hours: number;
  projectCount: number;
  weekIndex: number;
  dayIndex: number;
  isFuture: boolean;
};

export type DashboardRecentEntry = {
  id: string;
  projectName: string;
  projectColor: string | undefined;
  hours: number;
  date: string;
  createdAt: string;
};
