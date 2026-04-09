export type WorkEntry = {
  date: string;
  totalHours: number;
  remoteHours: number;
  projects: string[];
  project?: string | null;
  description: string;
  receiptFileNames: string[];
  updatedAt: string;
};

export type SaveWorkEntryInput = {
  date: string;
  totalHours: number;
  remoteHours: number;
  projects: string[];
  description: string;
  receiptFileNames: string[];
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
  day: string;
  hours: number;
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

export type CompactDailyBreakdownRow = {
  date: string;
  day: string;
  dateLabel: string;
  hours: number;
  projectLabel: string;
  receiptCount: number;
};
