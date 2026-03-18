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

export type DashboardMockData = {
  user: {
    firstName: string;
    fullName: string;
    initials: string;
  };
  recentLogs: DashboardLog[];
  weeklyOverview: WeeklyPoint[];
};

export const dashboardMockData: DashboardMockData = {
  user: {
    firstName: "Alex",
    fullName: "Alex Johnson",
    initials: "AJ",
  },
  recentLogs: [
    {
      id: "backend-api-1",
      title: "Backend API",
      location: "Remote",
      summary: "Worked on API integration and unit tests.",
      hours: 8,
      dateLabel: "Yesterday",
    },
    {
      id: "design-system-1",
      title: "Design System",
      location: "Office",
      summary: "Sprint planning and design review for the next release.",
      hours: 7.5,
      dateLabel: "Mar 15",
    },
    {
      id: "client-portal-1",
      title: "Client Portal",
      location: "Remote",
      summary: "Client call in the morning, feature development in the afternoon.",
      hours: 8,
      dateLabel: "Mar 14",
    },
    {
      id: "backend-api-2",
      title: "Backend API",
      location: "Remote",
      summary: "Documentation updates and code review support.",
      hours: 6,
      dateLabel: "Mar 13",
    },
  ],
  weeklyOverview: [
    { day: "Wed", hours: 0 },
    { day: "Thu", hours: 0 },
    { day: "Fri", hours: 3.5 },
    { day: "Sat", hours: 5 },
    { day: "Sun", hours: 4.5 },
    { day: "Mon", hours: 2.5 },
    { day: "Tue", hours: 0 },
  ],
};
