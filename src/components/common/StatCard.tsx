import type { ReactNode } from "react";
import { motion } from "framer-motion";
import ButtonBase from "@mui/material/ButtonBase";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import {
  dashboardFocusVisibleSx,
  dashboardInteractiveCardSx,
} from "../../styles/dashboard";
import { GREY, brandPurpleAlpha, whiteAlpha } from "../../styles/colors";

type StatCardProps = {
  title: string;
  value: string;
  unit?: string;
  subtitle?: string;
  icon: ReactNode;
  iconColor: string;
  iconTint?: string;
  valueColor?: string;
  badgeLabel?: string;
  featured?: boolean;
  onClick?: () => void;
  ariaLabel: string;
  animationIndex?: number;
};

export default function StatCard({
  title,
  value,
  unit,
  subtitle,
  icon,
  iconColor,
  iconTint,
  valueColor = GREY[800],
  badgeLabel,
  featured = false,
  onClick,
  ariaLabel,
  animationIndex = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      whileHover={{ y: -3 }}
      transition={{
        type: "spring",
        stiffness: 180,
        damping: 18,
        mass: 0.9,
        delay: 0.08 + animationIndex * 0.08,
      }}
      style={{ height: "100%" }}
    >
      <ButtonBase
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        sx={{
          width: "100%",
          height: "100%",
          display: "block",
          borderRadius: "24px",
          textAlign: "left",
          cursor: "pointer",
          ...dashboardFocusVisibleSx,
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 1.95, md: 2.2 },
            minHeight: { xs: 148, md: 158 },
            height: "100%",
            ...dashboardInteractiveCardSx,
            borderColor: featured ? brandPurpleAlpha(0.2) : undefined,
            boxShadow: featured ? `0 12px 34px ${brandPurpleAlpha(0.11)}` : undefined,
            backgroundColor: featured ? whiteAlpha(0.62) : undefined,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 1.25 }}>
            <Box sx={{ display: "grid", gap: 0.55 }}>
              <Typography
                variant="subtitle2"
                sx={{
                  color: featured ? "ink.labelStrong" : "ink.label",
                  fontWeight: 600,
                  letterSpacing: "-0.01em",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {title}
              </Typography>
              {badgeLabel ? (
                <Box
                  component="span"
                  sx={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "fit-content",
                    px: 1,
                    py: 0.45,
                    borderRadius: 999,
                    backgroundColor: featured ? brandPurpleAlpha(0.12) : brandPurpleAlpha(0.08),
                    color: featured ? "accentPurple.deep" : "ink.muted",
                    fontSize: "0.72rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                    lineHeight: 1,
                  }}
                >
                  {badgeLabel}
                </Box>
              ) : null}
            </Box>

            {/* Keep the icon integrated into the card, not visually stronger than the whole surface. */}
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: "50%",
                display: "grid",
                placeItems: "center",
                bgcolor: iconTint ?? alpha(iconColor, featured ? 0.14 : 0.1),
                color: iconColor,
                boxShadow: `inset 0 0 0 1px ${alpha(iconColor, featured ? 0.18 : 0.1)}`,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          </Box>

          <Box sx={{ mt: { xs: 1.55, md: 1.75 } }}>
            <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.45 }}>
              <Typography
                component="p"
                sx={{
                  fontSize: { xs: featured ? "2.75rem" : "2.45rem", md: featured ? "3rem" : "2.8rem" },
                  fontWeight: 700,
                  letterSpacing: "-0.05em",
                  lineHeight: 0.95,
                  color: valueColor,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {value}
              </Typography>
              {unit ? (
                <Typography
                  variant="body2"
                  sx={{
                    color: "ink.unit",
                    fontWeight: 500,
                    letterSpacing: "-0.01em",
                    lineHeight: 1,
                    fontFamily: "'Plus Jakarta Sans', sans-serif",
                  }}
                >
                  {unit}
                </Typography>
              ) : null}
            </Box>

            {subtitle ? (
              <Typography
                variant="body2"
                sx={{
                  mt: 0.75,
                  color: "ink.subtle",
                  fontWeight: 500,
                  lineHeight: 1.42,
                  maxWidth: "25ch",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {subtitle}
              </Typography>
            ) : null}
          </Box>
        </Paper>
      </ButtonBase>
    </motion.div>
  );
}
