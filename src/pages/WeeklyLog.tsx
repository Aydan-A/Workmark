import { useMemo, useState } from "react";
import { Alert, Box, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import WeeklyOverviewCard from "../features/dashboard/components/WeeklyOverviewCard";
import RangeSelectorTabs from "../features/dashboard/components/RangeSelectorTabs";
import { useWeeklyData } from "../features/weekly/hooks/useWeeklyData";
import { useAuth } from "../hooks/useAuth";
import type { WeeklyPoint } from "../features/entries/entry.types";
import type { SummaryTab, DateRange } from "../features/dashboard/rangeSelector.utils";
import { getBuiltinRange, getCustomHumanLabel } from "../features/dashboard/rangeSelector.utils";

export default function WeeklyLog() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<SummaryTab>("this-week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const referenceDate = useMemo(() => new Date(), []);
  const today = format(referenceDate, "yyyy-MM-dd");

  const activeRange = useMemo<DateRange>(() => {
    if (activeTab === "custom") {
      const start = customStart || today;
      const end = customEnd || today;
      return {
        start,
        end,
        label: "In the selected range",
        humanLabel: getCustomHumanLabel(customStart, customEnd),
      };
    }
    return getBuiltinRange(activeTab, referenceDate);
  }, [activeTab, customStart, customEnd, today, referenceDate]);

  const {
    activeDays,
    activeDaysLabel,
    averagePerDay,
    dashboardErrors,
    highestPoint,
    weeklyOverview,
    weeklyTotal,
  } = useWeeklyData({ user, authLoading, start: activeRange.start, end: activeRange.end });

  const handleBarClick = (day: WeeklyPoint) => {
    navigate(`/day/${format(new Date(`${day.dateKey}T00:00:00`), "yyyy-MM-dd")}`);
  };

  const rangeSelector = (
    <RangeSelectorTabs
      activeTab={activeTab}
      customStart={customStart}
      customEnd={customEnd}
      today={today}
      humanLabel={activeRange.humanLabel}
      onTabChange={setActiveTab}
      onCustomStartChange={setCustomStart}
      onCustomEndChange={setCustomEnd}
    />
  );

  return (
    <Box sx={{ maxWidth: 980, mx: "auto" }}>
      <Stack spacing={2.5}>
        {dashboardErrors.map((error) => (
          <Alert key={error} severity="warning">
            {error}
          </Alert>
        ))}

        <WeeklyOverviewCard
          days={weeklyOverview}
          totalHours={weeklyTotal}
          activeDays={activeDays}
          activeDaysLabel={activeDaysLabel}
          peakDay={highestPoint}
          averagePerDay={averagePerDay}
          rangeSelector={rangeSelector}
          onBarClick={handleBarClick}
        />
      </Stack>
    </Box>
  );
}
