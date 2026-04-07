import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Box, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

type StatCardProps = {
  icon: ReactNode;
  label: string;
  value: string;
  suffix?: string;
  helperText?: string;
  animationIndex?: number;
};

export default function StatCard({ icon, label, value, suffix, helperText, animationIndex = 0 }: StatCardProps) {
  const theme = useTheme();

  return (
    <motion.div
      initial={{ opacity: 0, y: 28, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -6, scale: 1.015 }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 18,
        mass: 0.9,
        delay: 0.12 + animationIndex * 0.1,
      }}
      whileTap={{ scale: 0.995 }}
      style={{ height: "100%", willChange: "transform, opacity" }}
    >
      <Paper
        variant="outlined"
        sx={{
          p: 2.75,
          borderRadius: 5,
          bgcolor: "background.paper",
          borderColor: "divider",
          minHeight: 188,
          position: "relative",
          overflow: "hidden",
          backgroundImage:
            "linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.94) 100%)",
          transition: "box-shadow 220ms ease, border-color 220ms ease, background-color 220ms ease",
          boxShadow: "0 10px 24px rgba(15, 23, 42, 0.04)",
          "&:hover": {
            boxShadow: "0 20px 40px rgba(15, 23, 42, 0.1)",
            borderColor: alpha(theme.palette.primary.main, 0.18),
          },
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: -18,
            top: -18,
            width: 90,
            height: 90,
            borderRadius: "50%",
            bgcolor: alpha(theme.palette.primary.main, 0.06),
          }}
        />

        <Box
          sx={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 132,
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: "primary.main",
              boxShadow: "inset 0 0 0 1px rgba(112, 87, 246, 0.08)",
            }}
          >
            {icon}
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 2.25, color: "text.secondary" }}>
            {label}
          </Typography>

          <Box sx={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 1, mt: 1.5 }}>
            <Typography
              variant="h3"
              sx={{
                fontSize: { xs: "2rem", md: "2.3rem" },
                letterSpacing: "-0.04em",
                lineHeight: 1,
              }}
            >
              {value}
            </Typography>
            {suffix ? (
              <Typography variant="subtitle1" sx={{ color: "text.secondary", fontWeight: 500 }}>
                {suffix}
              </Typography>
            ) : null}
          </Box>

          {helperText ? (
            <Typography variant="body2" sx={{ mt: 1.25, color: "text.secondary" }}>
              {helperText}
            </Typography>
          ) : null}
        </Box>
      </Paper>
    </motion.div>
  );
}
