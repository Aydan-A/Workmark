import { Box, ButtonBase, Stack, Typography } from "@mui/material";
import type { SummaryTab } from "../rangeSelector.utils";

const TAB_LABELS: { tab: SummaryTab; label: string }[] = [
  { tab: "today", label: "Today" },
  { tab: "this-week", label: "This week" },
  { tab: "last-7", label: "Last 7 days" },
  { tab: "this-month", label: "This month" },
  { tab: "custom", label: "Custom" },
];

const dateInputSx: React.CSSProperties = {
  width: "100%",
  padding: "10px 14px",
  borderRadius: "12px",
  border: "1px solid rgba(124, 106, 214, 0.3)",
  backgroundColor: "rgba(255,255,255,0.8)",
  fontFamily: "inherit",
  fontSize: "0.95rem",
  color: "#1f2340",
  outline: "none",
  boxSizing: "border-box",
};

type Props = {
  activeTab: SummaryTab;
  customStart: string;
  customEnd: string;
  today: string;
  humanLabel: string;
  onTabChange: (tab: SummaryTab) => void;
  onCustomStartChange: (v: string) => void;
  onCustomEndChange: (v: string) => void;
};

export default function RangeSelectorTabs({
  activeTab,
  customStart,
  customEnd,
  today,
  humanLabel,
  onTabChange,
  onCustomStartChange,
  onCustomEndChange,
}: Props) {
  return (
    <>
      {/* Pill buttons — the entire pill is the click target */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.75, mb: 1 }}>
        {TAB_LABELS.map(({ tab, label }) => {
          const isActive = activeTab === tab;
          return (
            <ButtonBase
              key={tab}
              onClick={() => onTabChange(tab)}
              sx={{
                px: 2,
                py: 0.75,
                borderRadius: 999,
                fontSize: "0.875rem",
                fontWeight: isActive ? 600 : 500,
                fontFamily: "inherit",
                bgcolor: isActive ? "primary.main" : "rgba(112, 87, 246, 0.08)",
                color: isActive ? "#fff" : "text.secondary",
                border: "1px solid",
                borderColor: isActive ? "primary.main" : "rgba(112, 87, 246, 0.15)",
                transition: "background-color 160ms ease, color 160ms ease, border-color 160ms ease",
                "&:hover": {
                  bgcolor: isActive ? "primary.dark" : "rgba(112, 87, 246, 0.14)",
                },
                "&:focus-visible": {
                  outline: "2px solid rgba(108,99,255,0.42)",
                  outlineOffset: 2,
                },
              }}
            >
              {label}
            </ButtonBase>
          );
        })}
      </Box>

      {activeTab !== "custom" && (
        <Typography
          sx={{
            mt: 0.5,
            mb: 2,
            fontSize: "0.8125rem",
            color: "text.secondary",
            fontWeight: 500,
          }}
        >
          {humanLabel}
        </Typography>
      )}

      {activeTab === "custom" && (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          sx={{ mt: 1, mb: 2 }}
        >
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ mb: 0.5, display: "block", color: "text.secondary" }}
            >
              From
            </Typography>
            <input
              type="date"
              value={customStart}
              max={customEnd || today}
              onChange={(e) => onCustomStartChange(e.target.value)}
              style={dateInputSx}
            />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="caption"
              sx={{ mb: 0.5, display: "block", color: "text.secondary" }}
            >
              To
            </Typography>
            <input
              type="date"
              value={customEnd}
              min={customStart}
              max={today}
              onChange={(e) => onCustomEndChange(e.target.value)}
              style={dateInputSx}
            />
          </Box>
        </Stack>
      )}
    </>
  );
}
