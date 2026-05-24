import { useEffect, useMemo, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import EmailIcon from "@mui/icons-material/Email";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import RefreshIcon from "@mui/icons-material/Refresh";
import { format } from "date-fns";
import type { WorkEntry } from "../../entries/entry.types";
import { formatHoursDuration } from "../../../utils/formatters";
import { breakdownToText } from "../summary.utils";
import { useSummaryData } from "../hooks/useSummaryData";
import {
  dashboardGlassCardSx,
  dashboardSectionCardPaddingSx,
} from "../../../styles/dashboard";
import { brandPurpleAlpha, whiteAlpha } from "../../../styles/colors";
import type { SummaryTab, DateRange } from "../rangeSelector.utils";
import { getBuiltinRange, getCustomHumanLabel } from "../rangeSelector.utils";
import RangeSelectorTabs from "./RangeSelectorTabs";

type Props = {
  historyEntries: WorkEntry[];
  isLoading: boolean;
  readOnly?: boolean;
};

function StatPill({ label, value }: { label: string; value: string | null }) {
  return (
    <Box
      sx={{
        flex: 1,
        p: { xs: 1.5, md: 2 },
        borderRadius: "16px",
        bgcolor: whiteAlpha(0.6),
        border: `1px solid ${whiteAlpha(0.9)}`,
        boxShadow: `0 2px 8px ${brandPurpleAlpha(0.06)}`,
        textAlign: "center",
        minWidth: 0,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.6875rem",
          fontWeight: 600,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "text.disabled",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      {value === null ? (
        <Skeleton variant="text" height={32} width={60} sx={{ mx: "auto" }} />
      ) : (
        <Typography
          sx={{
            fontSize: "1.5rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
            color: "text.primary",
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {value}
        </Typography>
      )}
    </Box>
  );
}

export default function SummaryCard({ historyEntries, isLoading, readOnly = false }: Props) {
  const [activeTab, setActiveTab] = useState<SummaryTab>("this-week");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");
  const [editableContent, setEditableContent] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryRevision, setSummaryRevision] = useState(0);
  const [copied, setCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  const hasCustomDates = activeTab !== "custom" || (!!customStart && !!customEnd);

  const stats = useSummaryData(historyEntries, activeRange.start, activeRange.end);

  useEffect(() => {
    if (!hasCustomDates) {
      setEditableContent("");
      setSummaryLoading(false);
      return;
    }
    setSummaryLoading(true);
    setEditableContent("");
    const timeout = setTimeout(() => {
      setEditableContent(breakdownToText(stats.projectBreakdowns));
      setSummaryLoading(false);
    }, 350);
    return () => clearTimeout(timeout);
    // summaryRevision triggers manual regeneration without changing other deps
  }, [stats.projectBreakdowns, hasCustomDates, summaryRevision]);

  const handleRegenerate = () => setSummaryRevision((r) => r + 1);

  const handleCopy = async () => {
    if (!editableContent) return;
    await navigator.clipboard.writeText(editableContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEmail = () => {
    if (!editableContent) return;
    const subject = encodeURIComponent(
      `Work Summary — ${activeRange.humanLabel || activeRange.label}`,
    );
    const body = encodeURIComponent(editableContent);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_blank");
  };

  const handlePdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    const margin = 20;
    const contentWidth = 170;
    let y = 24;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor(31, 35, 64);
    doc.text("Work Summary", margin, y);
    y += 9;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(111, 118, 143);
    doc.text(activeRange.humanLabel || activeRange.label, margin, y);
    y += 10;

    doc.setDrawColor(200, 195, 230);
    doc.line(margin, y, 210 - margin, y);
    y += 10;

    for (const line of editableContent.split("\n")) {
      if (y > 272) { doc.addPage(); y = 20; }
      if (line.trim() === "") { y += 4; continue; }

      const isProjectHeader = !line.startsWith("  ") && line.includes("  —  ");
      const isBullet = line.trimStart().startsWith("•");

      doc.setFont("helvetica", isProjectHeader ? "bold" : "normal");
      doc.setFontSize(isProjectHeader ? 11 : 10);
      doc.setTextColor(
        isProjectHeader ? 31 : 111,
        isProjectHeader ? 35 : 118,
        isProjectHeader ? 64 : 143,
      );

      const indent = isBullet ? margin + 4 : margin;
      const wrapped = doc.splitTextToSize(
        line.trimStart(),
        contentWidth - (isBullet ? 4 : 0),
      ) as string[];
      doc.text(wrapped, indent, y);
      y += wrapped.length * (isProjectHeader ? 7 : 6);
    }

    if (y > 255) { doc.addPage(); y = 20; }
    y += 6;
    doc.setDrawColor(200, 195, 230);
    doc.line(margin, y, 210 - margin, y);
    y += 9;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(111, 118, 143);
    doc.text(
      `Total: ${stats.formattedTotalHours}  |  Projects: ${stats.projectCount}  |  Avg/day: ${formatHoursDuration(stats.avgHoursPerDay)}`,
      margin,
      y,
    );

    doc.save(`work-summary-${activeRange.start}-to-${activeRange.end}.pdf`);
  };

  const exportDisabled = !editableContent || isLoading || summaryLoading;

  const exportBtnSx = {
    borderRadius: "12px",
    borderColor: brandPurpleAlpha(0.3),
    color: "primary.main",
    "&:hover": {
      borderColor: "primary.main",
      bgcolor: brandPurpleAlpha(0.05),
    },
  };

  return (
    <Paper
      variant="outlined"
      sx={{ ...dashboardGlassCardSx, ...dashboardSectionCardPaddingSx }}
    >
      <Typography
        sx={{
          fontSize: { xs: "1.2rem", md: "1.3rem" },
          fontWeight: 600,
          letterSpacing: "-0.01em",
          mb: 2.5,
        }}
      >
        Summary
      </Typography>

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

      {/* Stat pills */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
        <StatPill
          label="Total hours"
          value={isLoading ? null : stats.formattedTotalHours}
        />
        <StatPill
          label="Projects"
          value={isLoading ? null : String(stats.projectCount)}
        />
        <StatPill
          label="Avg / day"
          value={isLoading ? null : formatHoursDuration(stats.avgHoursPerDay)}
        />
      </Stack>

      {/* Breakdown header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 1 }}
      >
        <Typography
          sx={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "text.disabled",
          }}
        >
          Breakdown
        </Typography>
        {!readOnly && (
          <IconButton
            size="small"
            onClick={handleRegenerate}
            disabled={isLoading || summaryLoading || !hasCustomDates}
            title="Regenerate"
            sx={{
              color: "primary.main",
              opacity: 0.7,
              "&:hover": { opacity: 1, bgcolor: brandPurpleAlpha(0.08) },
            }}
          >
            <RefreshIcon sx={{ fontSize: "1rem" }} />
          </IconButton>
        )}
      </Stack>

      {/* Editable breakdown */}
      <Box sx={{ mb: 3 }}>
        {isLoading || summaryLoading ? (
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: brandPurpleAlpha(0.04),
              minHeight: 120,
            }}
          >
            <Stack spacing={1.5}>
              <Skeleton variant="text" height={18} width="60%" />
              <Skeleton variant="text" height={16} width="45%" sx={{ ml: 1 }} />
              <Skeleton variant="text" height={16} width="55%" sx={{ ml: 1 }} />
              <Box sx={{ pt: 0.5 }} />
              <Skeleton variant="text" height={18} width="50%" />
              <Skeleton variant="text" height={16} width="40%" sx={{ ml: 1 }} />
            </Stack>
          </Box>
        ) : activeTab === "custom" && !hasCustomDates ? (
          <Box
            sx={{
              p: 2,
              borderRadius: "12px",
              bgcolor: brandPurpleAlpha(0.04),
              minHeight: 80,
              display: "flex",
              alignItems: "center",
            }}
          >
            <Typography sx={{ fontSize: "0.9rem", color: "text.secondary" }}>
              Select a start and end date above to see your breakdown.
            </Typography>
          </Box>
        ) : (
          <textarea
            ref={textareaRef}
            value={editableContent}
            onChange={(e) => setEditableContent(e.target.value)}
            readOnly={readOnly}
            rows={8}
            style={{
              width: "100%",
              padding: "14px 16px",
              borderRadius: "12px",
              border: "1px solid transparent",
              backgroundColor: brandPurpleAlpha(0.04),
              fontFamily:
                '"Plus Jakarta Sans", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
              fontSize: "0.9rem",
              lineHeight: 1.75,
              color: "ink.base",
              resize: "vertical",
              outline: "none",
              boxSizing: "border-box",
              transition: "border-color 160ms ease, box-shadow 160ms ease",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = brandPurpleAlpha(0.25);
              e.currentTarget.style.boxShadow = `0 0 0 3px ${brandPurpleAlpha(0.08)}`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        )}
      </Box>

      {/* Export buttons */}
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<ContentCopyIcon sx={{ fontSize: "1rem" }} />}
          onClick={() => { void handleCopy(); }}
          disabled={exportDisabled}
          sx={exportBtnSx}
        >
          {copied ? "Copied!" : "Copy text"}
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<EmailIcon sx={{ fontSize: "1rem" }} />}
          onClick={handleEmail}
          disabled={exportDisabled}
          sx={exportBtnSx}
        >
          Email to client
        </Button>
        <Button
          variant="outlined"
          size="small"
          startIcon={<PictureAsPdfIcon sx={{ fontSize: "1rem" }} />}
          onClick={() => { void handlePdf(); }}
          disabled={exportDisabled}
          sx={exportBtnSx}
        >
          Send PDF
        </Button>
      </Stack>
    </Paper>
  );
}
