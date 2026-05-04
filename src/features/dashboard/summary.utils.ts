export type ProjectBreakdown = {
  name: string;
  hours: number;
  formattedHours: string;
  notes: string[];
};

export function breakdownToText(breakdowns: ProjectBreakdown[]): string {
  if (breakdowns.length === 0) return "No entries logged for this period.";

  return breakdowns
    .map((p) => {
      const header = `${p.name}  —  ${p.formattedHours}`;
      if (p.notes.length === 0) return header;
      const bullets = p.notes.map((n) => `  • ${n}`).join("\n");
      return `${header}\n${bullets}`;
    })
    .join("\n\n");
}
