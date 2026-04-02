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
