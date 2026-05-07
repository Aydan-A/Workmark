import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha, useTheme } from "@mui/material/styles";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export function CalendarLegend() {
  const theme = useTheme();

  const swatches = [
    { bg: "transparent", bordered: true },
    { bg: alpha(theme.palette.primary.main, 0.15), bordered: false },
    { bg: alpha(theme.palette.primary.main, 0.4), bordered: false },
    { bg: theme.palette.primary.main, bordered: false },
  ];

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ mt: 2, px: 0.5 }}
    >
      <Stack direction="row" alignItems="center" spacing={0.75}>
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>Less</Typography>
        {swatches.map((swatch, i) => (
          <Box
            key={i}
            sx={{
              width: 14,
              height: 14,
              borderRadius: "3px",
              backgroundColor: swatch.bg,
              border: "1px solid",
              borderColor: swatch.bordered ? "divider" : "transparent",
            }}
          />
        ))}
        <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>More</Typography>
      </Stack>

      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          color: "text.secondary",
          "&:hover": { bgcolor: "action.hover" },
        }}
      >
        <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
      </Box>

      <Typography sx={{ fontSize: "0.75rem", color: "text.secondary" }}>
        Tap a day to log
      </Typography>
    </Stack>
  );
}
