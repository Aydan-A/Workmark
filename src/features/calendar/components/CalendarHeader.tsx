import { useState } from "react";
import { Box, Button, IconButton, Menu, MenuItem, Stack, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { format } from "date-fns";

type Props = {
  visibleMonth: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
};

export function CalendarHeader({ visibleMonth, onPrev, onNext, onToday }: Props) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null);

  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center">
      <Box>
        <Typography
          sx={{
            fontSize: "0.6875rem",
            fontWeight: 600,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "text.secondary",
            lineHeight: 1,
          }}
        >
          Calendar
        </Typography>
        <Typography
          sx={{
            fontSize: "2rem",
            fontWeight: 700,
            lineHeight: 1.1,
            color: "text.primary",
            mt: 0.5,
            letterSpacing: "-0.02em",
          }}
        >
          {format(visibleMonth, "MMMM yyyy")}
        </Typography>
      </Box>

      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            border: "1px solid",
            borderColor: "divider",
            borderRadius: "12px",
            overflow: "hidden",
          }}
        >
          <IconButton
            size="small"
            onClick={onPrev}
            aria-label="Previous month"
            sx={{ borderRadius: 0, px: 1, py: 0.75 }}
          >
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <Box sx={{ width: "1px", alignSelf: "stretch", bgcolor: "divider" }} />
          <Button
            variant="text"
            size="small"
            onClick={onToday}
            sx={{
              borderRadius: 0,
              px: 1.5,
              minWidth: 0,
              fontWeight: 600,
              fontSize: "0.8125rem",
              color: "text.secondary",
              "&:hover": { bgcolor: "action.hover" },
            }}
          >
            Today
          </Button>
          <Box sx={{ width: "1px", alignSelf: "stretch", bgcolor: "divider" }} />
          <IconButton
            size="small"
            onClick={onNext}
            aria-label="Next month"
            sx={{ borderRadius: 0, px: 1, py: 0.75 }}
          >
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>

        <IconButton
          size="small"
          aria-label="More options"
          onClick={(e) => setMenuAnchor(e.currentTarget)}
        >
          <MoreVertIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={menuAnchor}
          open={Boolean(menuAnchor)}
          onClose={() => setMenuAnchor(null)}
          transformOrigin={{ horizontal: "right", vertical: "top" }}
          anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          <MenuItem disabled sx={{ fontSize: "0.875rem" }}>
            Export CSV
          </MenuItem>
        </Menu>
      </Stack>
    </Stack>
  );
}
